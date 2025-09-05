/**
 * Enhanced NcTableSearch Component Example
 *
 * This demonstrates improved type safety, validation, and UX features
 * that could be implemented in the current NcTableSearch component.
 */

import React, { useState, useCallback, useMemo, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, AlertCircle, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Enhanced type definitions
export type SearchDataType =
  | "text"
  | "date"
  | "select"
  | "boolean"
  | "YesOrNo"
  | "number";

export type SearchOperator =
  | "=="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "~="
  | "!~="
  | "_="
  | "!_="
  | "|="
  | "!|=";

export interface SearchCondition<T = unknown> {
  id: number;
  column: string;
  operator: SearchOperator;
  value: T;
  dataType: SearchDataType;
  isValid?: boolean;
  errorMessage?: string;
}

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errorMessage?: string;
  sanitizedValue?: T;
}

export interface ColumnConfig {
  key: string;
  header: string;
  searchable?: boolean;
  searchOverride?: {
    dataType: SearchDataType;
    selectOptions?: Array<{ text: string; value: unknown }>;
    min?: number;
    max?: number;
    format?: string;
  };
}

// Operator compatibility configuration
const OPERATOR_COMPATIBILITY: Record<
  SearchDataType,
  {
    operators: SearchOperator[];
    defaultOperator: SearchOperator;
  }
> = {
  text: {
    operators: ["==", "!=", "~=", "!~=", "_=", "!_=", "|=", "!|="],
    defaultOperator: "~=",
  },
  number: {
    operators: ["==", "!=", ">", ">=", "<", "<="],
    defaultOperator: ">=",
  },
  date: {
    operators: ["==", "!=", ">", ">=", "<", "<="],
    defaultOperator: ">=",
  },
  select: {
    operators: ["==", "!="],
    defaultOperator: "==",
  },
  boolean: {
    operators: ["==", "!="],
    defaultOperator: "==",
  },
  YesOrNo: {
    operators: ["==", "!="],
    defaultOperator: "==",
  },
};

// Validation utilities
class SearchValidator {
  static validateCondition<T>(
    condition: SearchCondition<T>,
    columnConfig?: ColumnConfig
  ): ValidationResult<T> {
    const { dataType, value } = condition;
    const config = columnConfig?.searchOverride;

    switch (dataType) {
      case "date":
        return this.validateDate(value as string);
      case "number":
        return this.validateNumber(value as string, config);
      case "boolean":
        return this.validateBoolean(value as string);
      case "YesOrNo":
        return this.validateYesOrNo(value as string);
      case "select":
        return this.validateSelect(value, config?.selectOptions);
      default:
        return this.validateText(value as string);
    }
  }

  private static validateDate(value: string): ValidationResult<Date> {
    if (!value) return { isValid: false, errorMessage: "Date is required" };

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, errorMessage: "Please enter a valid date" };
    }

    return { isValid: true, sanitizedValue: date };
  }

  private static validateNumber(
    value: string,
    config?: { min?: number; max?: number }
  ): ValidationResult<number> {
    if (!value) return { isValid: false, errorMessage: "Number is required" };

    const num = parseFloat(value);
    if (isNaN(num)) {
      return { isValid: false, errorMessage: "Please enter a valid number" };
    }

    if (config?.min !== undefined && num < config.min) {
      return {
        isValid: false,
        errorMessage: `Value must be at least ${config.min}`,
      };
    }

    if (config?.max !== undefined && num > config.max) {
      return {
        isValid: false,
        errorMessage: `Value must be at most ${config.max}`,
      };
    }

    return { isValid: true, sanitizedValue: num };
  }

  private static validateBoolean(value: string): ValidationResult<boolean> {
    if (!value)
      return { isValid: false, errorMessage: "Please select a value" };

    const boolValue = value.toLowerCase();
    if (!["true", "false"].includes(boolValue)) {
      return { isValid: false, errorMessage: "Invalid boolean value" };
    }

    return { isValid: true, sanitizedValue: boolValue === "true" };
  }

  private static validateYesOrNo(value: string): ValidationResult<number> {
    if (!value)
      return { isValid: false, errorMessage: "Please select a value" };

    const numValue = parseInt(value);
    if (![0, 1].includes(numValue)) {
      return { isValid: false, errorMessage: "Invalid Yes/No value" };
    }

    return { isValid: true, sanitizedValue: numValue };
  }

  private static validateSelect(
    value: unknown,
    options?: Array<{ text: string; value: unknown }>
  ): ValidationResult<unknown> {
    if (!value)
      return { isValid: false, errorMessage: "Please select a value" };

    if (options && !options.some((opt) => opt.value === value)) {
      return { isValid: false, errorMessage: "Selected value is not valid" };
    }

    return { isValid: true, sanitizedValue: value };
  }

  private static validateText(value: string): ValidationResult<string> {
    if (!value || value.trim() === "") {
      return { isValid: false, errorMessage: "Text is required" };
    }

    return { isValid: true, sanitizedValue: value.trim() };
  }
}

// Enhanced search state management
interface SearchState {
  conditions: SearchCondition[];
  activeFilters: SearchCondition[];
  errors: Record<number, string>;
  isValidating: boolean;
  nextId: number;
}

type SearchAction =
  | { type: "ADD_CONDITION"; payload: Partial<SearchCondition> }
  | {
      type: "UPDATE_CONDITION";
      payload: { id: number; updates: Partial<SearchCondition> };
    }
  | { type: "REMOVE_CONDITION"; payload: number }
  | {
      type: "VALIDATE_CONDITION";
      payload: { id: number; result: ValidationResult };
    }
  | { type: "APPLY_FILTERS"; payload: SearchCondition[] }
  | { type: "RESET_SEARCH" };

const searchReducer = (
  state: SearchState,
  action: SearchAction
): SearchState => {
  switch (action.type) {
    case "ADD_CONDITION": {
      const newCondition: SearchCondition = {
        id: state.nextId,
        column: "all",
        operator: "~=",
        value: "",
        dataType: "text",
        isValid: false,
        ...action.payload,
      };

      return {
        ...state,
        conditions: [...state.conditions, newCondition],
        nextId: state.nextId + 1,
      };
    }

    case "UPDATE_CONDITION": {
      const { id, updates } = action.payload;
      return {
        ...state,
        conditions: state.conditions.map((condition) =>
          condition.id === id ? { ...condition, ...updates } : condition
        ),
      };
    }

    case "REMOVE_CONDITION": {
      const filteredConditions = state.conditions.filter(
        (c) => c.id !== action.payload
      );

      // Keep at least one condition
      if (filteredConditions.length === 0) {
        return {
          ...state,
          conditions: [
            {
              id: state.nextId,
              column: "all",
              operator: "~=",
              value: "",
              dataType: "text",
              isValid: false,
            },
          ],
          nextId: state.nextId + 1,
        };
      }

      return {
        ...state,
        conditions: filteredConditions,
      };
    }

    case "VALIDATE_CONDITION": {
      const { id, result } = action.payload;
      return {
        ...state,
        conditions: state.conditions.map((condition) =>
          condition.id === id
            ? {
                ...condition,
                isValid: result.isValid,
                errorMessage: result.errorMessage,
                value: result.sanitizedValue ?? condition.value,
              }
            : condition
        ),
        errors: result.isValid
          ? { ...state.errors, [id]: undefined }
          : { ...state.errors, [id]: result.errorMessage || "Invalid value" },
      };
    }

    case "APPLY_FILTERS": {
      return {
        ...state,
        activeFilters: action.payload,
      };
    }

    case "RESET_SEARCH": {
      return {
        ...state,
        conditions: [
          {
            id: 1,
            column: "all",
            operator: "~=",
            value: "",
            dataType: "text",
            isValid: false,
          },
        ],
        activeFilters: [],
        errors: {},
        nextId: 2,
      };
    }

    default:
      return state;
  }
};

// Hook for managing search state
const useEnhancedSearch = (columns: ColumnConfig[]) => {
  const [state, dispatch] = useReducer(searchReducer, {
    conditions: [
      {
        id: 1,
        column: "all",
        operator: "~=",
        value: "",
        dataType: "text",
        isValid: false,
      },
    ],
    activeFilters: [],
    errors: {},
    isValidating: false,
    nextId: 2,
  });

  const addCondition = useCallback(() => {
    dispatch({ type: "ADD_CONDITION", payload: {} });
  }, []);

  const updateCondition = useCallback(
    (id: number, updates: Partial<SearchCondition>) => {
      dispatch({ type: "UPDATE_CONDITION", payload: { id, updates } });

      // Validate if we have enough information
      const condition = state.conditions.find((c) => c.id === id);
      if (condition) {
        const updatedCondition = { ...condition, ...updates };
        const column = columns.find((c) => c.key === updatedCondition.column);
        const result = SearchValidator.validateCondition(
          updatedCondition,
          column
        );
        dispatch({ type: "VALIDATE_CONDITION", payload: { id, result } });
      }
    },
    [state.conditions, columns]
  );

  const removeCondition = useCallback((id: number) => {
    dispatch({ type: "REMOVE_CONDITION", payload: id });
  }, []);

  const applySearch = useCallback(() => {
    const validConditions = state.conditions.filter((c) => c.isValid);
    dispatch({ type: "APPLY_FILTERS", payload: validConditions });
    return validConditions;
  }, [state.conditions]);

  const resetSearch = useCallback(() => {
    dispatch({ type: "RESET_SEARCH" });
  }, []);

  return {
    ...state,
    addCondition,
    updateCondition,
    removeCondition,
    applySearch,
    resetSearch,
  };
};

// Component for rendering individual search conditions
interface SearchConditionRowProps {
  condition: SearchCondition;
  columns: ColumnConfig[];
  onUpdate: (id: number, updates: Partial<SearchCondition>) => void;
  onRemove: (id: number) => void;
  error?: string;
}

const SearchConditionRow: React.FC<SearchConditionRowProps> = ({
  condition,
  columns,
  onUpdate,
  onRemove,
  error,
}) => {
  const searchableColumns = columns.filter((col) => col.searchable !== false);

  const selectedColumn = useMemo(
    () => columns.find((col) => col.key === condition.column),
    [columns, condition.column]
  );

  const dataType = selectedColumn?.searchOverride?.dataType || "text";

  const compatibleOperators = useMemo(() => {
    const config = OPERATOR_COMPATIBILITY[dataType];
    return config ? config.operators : OPERATOR_COMPATIBILITY.text.operators;
  }, [dataType]);

  const handleColumnChange = (columnKey: string) => {
    const newColumn = columns.find((col) => col.key === columnKey);
    const newDataType = newColumn?.searchOverride?.dataType || "text";
    const defaultOperator =
      OPERATOR_COMPATIBILITY[newDataType]?.defaultOperator || "~=";

    onUpdate(condition.id, {
      column: columnKey,
      dataType: newDataType,
      operator: defaultOperator,
      value: "", // Reset value when changing column
      isValid: false,
    });
  };

  const renderValueInput = () => {
    const config = selectedColumn?.searchOverride;

    switch (dataType) {
      case "date":
        return (
          <Input
            type="date"
            value={condition.value as string}
            onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
            className={`flex-1 ${error ? "border-red-500" : ""}`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder="Enter number"
            value={condition.value as string}
            onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
            min={config?.min}
            max={config?.max}
            className={`flex-1 ${error ? "border-red-500" : ""}`}
          />
        );

      case "select":
        return (
          <Select
            value={String(condition.value)}
            onValueChange={(value) => onUpdate(condition.id, { value })}
          >
            <SelectTrigger
              className={`flex-1 ${error ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {config?.selectOptions?.map((option, idx) => (
                <SelectItem key={idx} value={String(option.value)}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <Select
            value={String(condition.value)}
            onValueChange={(value) => onUpdate(condition.id, { value })}
          >
            <SelectTrigger
              className={`flex-1 ${error ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      case "YesOrNo":
        return (
          <Select
            value={String(condition.value)}
            onValueChange={(value) => onUpdate(condition.id, { value })}
          >
            <SelectTrigger
              className={`flex-1 ${error ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Yes</SelectItem>
              <SelectItem value="0">No</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            placeholder="Enter value"
            value={condition.value as string}
            onChange={(e) => onUpdate(condition.id, { value: e.target.value })}
            className={`flex-1 ${error ? "border-red-500" : ""}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Column selector */}
        <Select value={condition.column} onValueChange={handleColumnChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select Column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Columns</SelectItem>
            {searchableColumns.map((column) => (
              <SelectItem key={column.key} value={column.key}>
                {column.header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Operator selector */}
        <Select
          value={condition.operator}
          onValueChange={(operator) =>
            onUpdate(condition.id, { operator: operator as SearchOperator })
          }
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {compatibleOperators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {operator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value input */}
        <div className="flex w-full gap-2 items-start">
          {renderValueInput()}

          {/* Validation status */}
          <div className="flex items-center">
            {condition.isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(condition.id)}
            className="h-10 w-10 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Main enhanced search component
interface EnhancedNcTableSearchProps {
  columns: ColumnConfig[];
  onSearchApplied: (filters: SearchCondition[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const EnhancedNcTableSearch: React.FC<EnhancedNcTableSearchProps> = ({
  columns,
  onSearchApplied,
  isOpen,
  onOpenChange,
  className = "",
}) => {
  const {
    conditions,
    activeFilters,
    errors,
    addCondition,
    updateCondition,
    removeCondition,
    applySearch,
    resetSearch,
  } = useEnhancedSearch(columns);

  const handleApplySearch = () => {
    const validFilters = applySearch();
    onSearchApplied(validFilters);
    onOpenChange(false);
  };

  const handleResetSearch = () => {
    resetSearch();
    onSearchApplied([]);
  };

  const hasValidConditions = conditions.some((c) => c.isValid);
  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative ${className}`}
        >
          <Search className="h-4 w-4" />
          {activeFilters.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[95vw] max-w-[800px] p-6" align="end">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-lg">Advanced Search</h4>
            <Button
              variant="link"
              onClick={handleResetSearch}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset All
            </Button>
          </div>

          {/* Search conditions */}
          <div className="space-y-4">
            {conditions.map((condition) => (
              <SearchConditionRow
                key={condition.id}
                condition={condition}
                columns={columns}
                onUpdate={updateCondition}
                onRemove={removeCondition}
                error={errors[condition.id]}
              />
            ))}
          </div>

          {/* Add condition button */}
          <Button
            variant="outline"
            onClick={addCondition}
            className="w-full border-dashed"
          >
            + Add Another Condition
          </Button>

          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Active Filters ({activeFilters.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {filter.column} {filter.operator} "{String(filter.value)}"
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplySearch}
              disabled={!hasValidConditions}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Search
              {hasValidConditions && (
                <Badge variant="secondary" className="ml-2">
                  {conditions.filter((c) => c.isValid).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Status message */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before applying the search.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedNcTableSearch;
