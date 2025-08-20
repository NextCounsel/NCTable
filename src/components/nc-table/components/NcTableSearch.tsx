import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
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
import { Column } from "../types";

export interface SearchCondition {
  id: number;
  column: string;
  operator: string;
  value: string;
}

export interface SearchFilter {
  id: number;
  column: string;
  operator: string;
  value: string;
}

export interface SearchOperator {
  value: string;
  label: string;
}

interface NcTableSearchProps<T> {
  columns: Column<T>[];
  onSearchApplied: (filters: SearchFilter[]) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchOperators?: SearchOperator[];
  placeholder?: string;
  resetLabel?: string;
  addConditionLabel?: string;
  cancelLabel?: string;
  filterLabel?: string;
  searchLabel?: string;
  className?: string;
}

const defaultOperators: SearchOperator[] = [
  { value: "contains", label: "contains" },
  { value: "equals", label: "equals" },
  { value: "starts", label: "starts with" },
  { value: "ends", label: "ends with" },
  { value: "not_equals", label: "not equals" },
  { value: "greater", label: "greater than" },
  { value: "less", label: "less than" },
];

const NcTableSearch = <T,>({
  columns,
  onSearchApplied,
  isSearchOpen,
  setIsSearchOpen,
  searchOperators = defaultOperators,
  placeholder = "Enter Value",
  resetLabel = "Reset",
  addConditionLabel = "+ Add condition",
  cancelLabel = "Cancel",
  filterLabel = "Filter",
  searchLabel = "Search",
  className = "",
}: NcTableSearchProps<T>) => {
  const [searchConditions, setSearchConditions] = useState<SearchCondition[]>([
    { id: 1, column: "all", operator: "contains", value: "" },
  ]);
  const [nextConditionId, setNextConditionId] = useState(2);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  // Get searchable columns
  const searchableColumns = columns.filter((col) => col.searchable !== false);

  const updateSearchCondition = (id: number, field: string, value: string) => {
    setSearchConditions(
      searchConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const removeSearchCondition = (id: number) => {
    if (searchConditions.length > 1) {
      setSearchConditions(
        searchConditions.filter((condition) => condition.id !== id)
      );
    } else {
      // If it's the last condition, just clear it instead of removing
      setSearchConditions([
        { id: 1, column: "all", operator: "contains", value: "" },
      ]);
    }
  };

  const addSearchCondition = () => {
    setSearchConditions([
      ...searchConditions,
      { id: nextConditionId, column: "all", operator: "contains", value: "" },
    ]);
    setNextConditionId((prevId) => prevId + 1);
  };

  const removeSearchFilter = (id: number) => {
    const updatedFilters = searchFilters.filter((filter) => filter.id !== id);
    setSearchFilters(updatedFilters);
    onSearchApplied(updatedFilters);
  };

  const applySearch = () => {
    const validConditions = searchConditions.filter(
      (condition) => condition.value.trim() !== ""
    );
    if (validConditions.length > 0) {
      const newFilters = [...searchFilters, ...validConditions];
      setSearchFilters(newFilters);
      onSearchApplied(newFilters);
    } else {
      onSearchApplied(searchFilters);
    }
    setIsSearchOpen(false);
  };

  const resetSearch = () => {
    setSearchConditions([
      { id: 1, column: "all", operator: "contains", value: "" },
    ]);
    setSearchFilters([]);
    onSearchApplied([]);
  };

  const handleCancelSearch = () => {
    setIsSearchOpen(false);
  };

  const getColumnLabel = (columnKey: string) => {
    if (columnKey === "all") return "All Columns";
    const column = columns.find((col) => col.key === columnKey);
    return column?.header || columnKey;
  };

  return (
    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 ${className}`}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">{searchLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[95vw] max-w-[700px] p-4 sm:w-[700px]"
        align="end"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{searchLabel}</h4>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={resetSearch}
            >
              {resetLabel}
            </Button>
          </div>

          {searchConditions.map((condition) => (
            <div key={condition.id} className="flex flex-col sm:flex-row gap-2">
              <Select
                value={condition.column}
                onValueChange={(value) =>
                  updateSearchCondition(condition.id, "column", value)
                }
              >
                <SelectTrigger className="w-full sm:w-[250px]">
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

              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateSearchCondition(condition.id, "operator", value)
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="contains" />
                </SelectTrigger>
                <SelectContent>
                  {searchOperators.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex w-full gap-2">
                <Input
                  placeholder={placeholder}
                  value={condition.value}
                  onChange={(e) =>
                    updateSearchCondition(condition.id, "value", e.target.value)
                  }
                  className="flex-1"
                />

                {searchConditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSearchCondition(condition.id)}
                    className="h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {searchFilters.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Active Filters:
              </div>
              {searchFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center bg-muted px-2 py-1 rounded-md"
                >
                  <span className="text-sm break-all">
                    {getColumnLabel(filter.column)} {filter.operator} "
                    {filter.value}"
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 shrink-0"
                    onClick={() => removeSearchFilter(filter.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="link"
            className="text-primary p-0 h-auto"
            onClick={addSearchCondition}
          >
            {addConditionLabel}
          </Button>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelSearch}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              className="bg-[#075EA8] hover:bg-[#075EA8]/90"
              onClick={applySearch}
            >
              {filterLabel}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NcTableSearch;
