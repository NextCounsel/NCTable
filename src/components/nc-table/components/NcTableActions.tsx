import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Settings,
  Plus,
  ChevronDown,
  Upload,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TableSettings } from "../types";

export interface BulkAction {
  value: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

export interface ExportOption {
  format: string;
  label: string;
  icon?: React.ReactNode;
}

export interface CreateAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface ImportAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface NcTableActionsProps<T> {
  // Bulk actions
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: (string | number)[]) => void;
  selectedIds?: (string | number)[];

  // Export functionality
  exportOptions?: ExportOption[];
  onExport?: (format: string, selectedIds?: (string | number)[]) => void;

  // Create/Add functionality
  createAction?: CreateAction;
  importActions?: ImportAction[];

  // Search functionality
  onSearchToggle?: () => void;
  searchComponent?: React.ReactNode;

  // Settings functionality
  settings?: TableSettings;
  onSettingsChange?: (settings: TableSettings) => void;
  settingsComponent?: React.ReactNode;

  // General props
  className?: string;
  showBulkActions?: boolean;
  showExport?: boolean;
  showCreate?: boolean;
  showSearch?: boolean;
  showSettings?: boolean;
}

const NcTableActions = <T,>({
  bulkActions = [
    { value: "delete", label: "Delete Selected", variant: "destructive" },
    { value: "export", label: "Export Selected" },
  ],
  onBulkAction,
  selectedIds = [],
  exportOptions = [
    { format: "csv", label: "Export as CSV" },
    { format: "excel", label: "Export as Excel" },
    { format: "pdf", label: "Export as PDF" },
  ],
  onExport,
  createAction,
  importActions = [
    {
      label: "Import Data",
      icon: <Upload className="mr-2 h-4 w-4" />,
      onClick: () => {},
    },
    {
      label: "Download Template",
      icon: <FileDown className="mr-2 h-4 w-4" />,
      onClick: () => {},
    },
  ],
  onSearchToggle,
  searchComponent,
  settingsComponent,
  className = "",
  showBulkActions = true,
  showExport = true,
  showCreate = true,
  showSearch = true,
  showSettings = true,
}: NcTableActionsProps<T>) => {
  const [selectedBulkAction, setSelectedBulkAction] = useState<string>("");
  const isMobile = useIsMobile();

  const handleBulkActionApply = () => {
    if (selectedBulkAction && onBulkAction) {
      onBulkAction(selectedBulkAction, selectedIds);
      setSelectedBulkAction("");
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 border-b ${className}`}
    >
      {/* Left side actions - hidden on mobile */}
      <div className={`${isMobile ? "hidden" : "flex"} items-center gap-2`}>
        {showBulkActions && bulkActions.length > 0 && (
          <>
            <Select
              value={selectedBulkAction}
              onValueChange={setSelectedBulkAction}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk Action" />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.icon}
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActionApply}
              disabled={!selectedBulkAction || selectedIds.length === 0}
            >
              Apply
            </Button>
          </>
        )}

        {showExport && exportOptions.length > 0 && onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-[#E6F0F9]">
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {exportOptions.map((option) => (
                <DropdownMenuItem
                  key={option.format}
                  onClick={() =>
                    onExport(
                      option.format,
                      selectedIds.length > 0 ? selectedIds : undefined
                    )
                  }
                >
                  {option.icon}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* If mobile, show an empty div to maintain the flex layout */}
      {isMobile && <div></div>}

      {/* Right side actions - always visible */}
      <div className="flex items-center gap-2">
        {showSearch && (searchComponent || onSearchToggle) && (
          <>
            {searchComponent || (
              <Button variant="outline" size="icon" onClick={onSearchToggle}>
                <Search className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {showSettings && settingsComponent && settingsComponent}
      </div>
    </div>
  );
};

export const NcCreateButton = ({
  createAction,
  importActions = [],
}: {
  createAction?: CreateAction;
  importActions?: ImportAction[];
}) => {
  if (!createAction) return null;

  return (
    <div className="flex">
      <Button
        className="bg-[#075EA8] hover:bg-[#075EA8]/90 rounded-r-none"
        onClick={createAction.onClick}
      >
        {createAction.icon || <Plus className="mr-2 h-4 w-4" />}
        {createAction.label}
      </Button>
      {importActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#075EA8] hover:bg-[#075EA8]/90 rounded-l-none border-l border-[#0A4D85] px-2">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {importActions.map((action, index) => (
              <DropdownMenuItem key={index} onClick={action.onClick}>
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default NcTableActions;
