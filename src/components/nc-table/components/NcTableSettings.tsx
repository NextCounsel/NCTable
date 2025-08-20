import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Column, TableSettings } from "../types";

export interface PageSizeOption {
  value: number;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

interface NcTableSettingsProps<T> {
  columns: Column<T>[];
  settings: TableSettings;
  onSettingsChange: (settings: Partial<TableSettings>) => void;
  trigger: React.ReactNode;
  pageSizeOptions?: PageSizeOption[];
  sortOptions?: SortOption[];
  columnsLabel?: string;
  itemsPerPageLabel?: string;
  sortOrderLabel?: string;
  className?: string;
  maxHeight?: string;
}

const defaultPageSizeOptions: PageSizeOption[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

const defaultSortOptions: SortOption[] = [
  { value: "Asc", label: "Ascending" },
  { value: "Desc", label: "Descending" },
];

const NcTableSettings = <T,>({
  columns,
  settings,
  onSettingsChange,
  trigger,
  pageSizeOptions = defaultPageSizeOptions,
  sortOptions = defaultSortOptions,
  columnsLabel = "COLUMNS",
  itemsPerPageLabel = "ITEMS PER PAGE",
  sortOrderLabel = "SORT ORDER",
  className = "",
  maxHeight = "150px",
}: NcTableSettingsProps<T>) => {
  const handleColumnToggle = (columnKey: string) => {
    const currentVisibility = settings.columns[columnKey] !== false;
    onSettingsChange({
      columns: {
        ...settings.columns,
        [columnKey]: !currentVisibility,
      },
    });
  };

  const handlePageSizeChange = (value: string) => {
    onSettingsChange({
      pageSize: parseInt(value, 10),
    });
  };

  const handleSortDirectionChange = (value: string) => {
    onSettingsChange({
      sortDirection: value as "Asc" | "Desc",
    });
  };

  // Filter columns that can be hidden/shown (exclude columns that are always visible)
  const configurableColumns = columns.filter((col) => col.visible !== true);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-56 ${className}`}>
        {configurableColumns.length > 0 && (
          <>
            <DropdownMenuLabel>{columnsLabel}</DropdownMenuLabel>
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {configurableColumns.map((column) => {
                const isVisible =
                  settings.columns[column.key] !== false &&
                  column.visible !== false;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={isVisible}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel>{itemsPerPageLabel}</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <Select
            value={settings.pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={settings.pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{sortOrderLabel}</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <Select
            value={settings.sortDirection || "Asc"}
            onValueChange={handleSortDirectionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ascending" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NcTableSettings;
