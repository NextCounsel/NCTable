import { ReactNode } from "react";
import { PaginationData } from "@/models/IApp";
import { IApiResponse } from "@/models/IApiResponse";
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
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode | string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  className?: string;
  separator?: boolean;
}

export interface TableSettings {
  columns: {
    [key: string]: boolean;
  };
  pageSize: number;
  sortBy?: string;
  sortDirection?: "Asc" | "Desc";
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

export type DataHandler<T> = (
  params: PaginationData
) => Promise<IApiResponse<T[]>>;

export interface NcTableProps<T> {
  data?: T[];
  columns: Column<T>[];
  handler?: DataHandler<T>;
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
}
