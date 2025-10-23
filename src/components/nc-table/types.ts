import { ReactNode } from "react";
import { PaginationData } from "@/models/IApp";
import {
  IApiResponse,
  GenericApiResponse,
  ResponseConfig,
} from "@/models/IApiResponse";
import type {
  BulkAction,
  ExportOption,
  CreateAction,
  ImportAction,
  SearchFilter,
} from "./components";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  visible?: boolean;
  searchable?: boolean;
  searchOverride?: NcTableSearchOverride;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode | string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  className?: string;
  separator?: boolean;
  show?: boolean | ((item: T) => boolean);
}

export interface TableSettings {
  columns: {
    [key: string]: boolean;
  };
  pageSize: number;
  sortBy?: string;
  sortDirection?: "Asc" | "Desc";
}

export type NcTableSearchDataType =
  | "text"
  | "date"
  | "select"
  | "boolean"
  | "YesOrNo";

export interface NcTableSearchOption<T = unknown> {
  text: string;
  value: T;
}

export interface NcTableSearchOverride {
  key?: string; // Backend field name to use instead of column name
  dataType: NcTableSearchDataType;
  selectOptions?: NcTableSearchOption[];
}

export interface SearchField {
  key: string;
  label: string;
}

export interface TableSearchProps {
  searchFields: SearchField[];
  onSearch: (field: string, value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export interface TableDataParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

export interface TableDataResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// Generic data handler that can work with any response format
export type DataHandler<T, R = IApiResponse<T[]>> = (
  params: PaginationData
) => Promise<R>;

// Legacy type alias for backward compatibility
export type LegacyDataHandler<T> = DataHandler<T, IApiResponse<T[]>>;

export interface NcTableProps<T> {
  // Unique identifier for this table instance
  id?: string;
  data?: T[];
  columns: Column<T>[];
  handler?: DataHandler<T, any>;
  responseConfig?: ResponseConfig<T>; // Configuration for custom response format
  actions?: TableAction<T>[];
  settings?: TableSettings;
  onSettingsChange?: (settings: TableSettings) => void;
  onSearch?: (field: string, query: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  selectedIds?: (string | number)[];
  idField?: keyof T;
  className?: string;
  loading?: boolean;
  // Internal state management
  enableInternalSearch?: boolean;
  enableInternalSettings?: boolean;
  enableInternalPagination?: boolean;
  defaultSettings?: Partial<TableSettings>;

  // Enhanced component props
  // Table Actions
  showTableActions?: boolean;
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: (string | number)[]) => void;
  exportOptions?: ExportOption[];
  onExport?: (format: string, selectedIds?: (string | number)[]) => void;
  createAction?: CreateAction;
  importActions?: ImportAction[];

  // Advanced Search
  showAdvancedSearch?: boolean;
  onAdvancedSearch?: (filters: SearchFilter[]) => void;

  // Enhanced Pagination
  showPagination?: boolean;
  paginationProps?: {
    showFirstLast?: boolean;
    showEllipsis?: boolean;
    maxVisiblePages?: number;
    compact?: boolean;
    showingLabel?: string;
    ofLabel?: string;
    recordsLabel?: string;
    recordLabel?: string;
  };

  // Delete functionality
  canDelete?: boolean;
  removeItemHandler?: (
    ids: (string | number)[]
  ) => Promise<IApiResponse<unknown> | void> | IApiResponse<unknown> | void;

  // Serial number functionality
  showSerialNumber?: boolean;
}
