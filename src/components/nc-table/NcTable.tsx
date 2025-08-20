import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Settings } from "lucide-react";
import { PaginationData } from "@/models/IApp";
import { IApiResponse } from "@/models/IApiResponse";
import { useToast } from "@/hooks/use-toast";
import { NcTableProps, TableSettings, Column, TableAction } from "./types";
import {
  NcTableActions,
  NcTableSearch,
  NcTableSettings,
  NcTablePagination,
  type BulkAction,
  type ExportOption,
  type CreateAction,
  type ImportAction,
  type SearchFilter,
} from "./components";
import Icon from "./utils/iconMap";

const NcTable = <T extends Record<string, unknown>>({
  data: staticData,
  columns,
  handler,
  actions,
  settings: externalSettings,
  onSettingsChange,
  onSearch: externalOnSearch,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  totalItems: externalTotalItems,
  currentPage: externalCurrentPage,
  pageSize: externalPageSize = 10,
  searchPlaceholder = "Search...",
  emptyStateMessage = "No items found",
  selectable = true,
  onSelectionChange,
  selectedIds: externalSelectedIds = [],
  idField = "Id" as keyof T,
  className,
  loading: externalLoading = false,
  enableInternalSearch = true,
  enableInternalSettings = true,
  enableInternalPagination = true,
  defaultSettings,

  // Enhanced component props
  showTableActions = true,
  bulkActions,
  onBulkAction,
  exportOptions,
  onExport,
  createAction,
  importActions,
  showAdvancedSearch = true,
  onAdvancedSearch,
  showPagination = true,
  paginationProps = {},

  // Delete functionality props
  canDelete = false,
  removeItemHandler,
}: NcTableProps<T>) => {
  // Internal state management
  const [internalSettings, setInternalSettings] = useState<TableSettings>({
    columns: {},
    pageSize: externalPageSize,
    sortBy: undefined,
    sortDirection: "Asc",
    ...defaultSettings,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<T[]>(staticData || []);
  const [totalItems, setTotalItems] = useState(externalTotalItems || 0);
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set(externalSelectedIds)
  );
  const [error, setError] = useState<string | null>(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  // Enhanced search state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bulk delete confirmation state
  const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { t } = useTranslation();
  const { toast } = useToast();

  // Use external or internal settings
  const effectiveSettings = externalSettings || internalSettings;
  const shouldUseInternalSettings = enableInternalSettings && !externalSettings;

  // Fetch data using the handler
  const fetchData = useCallback(
    async (overrideParams?: {
      page?: number;
      search?: string;
      sortBy?: string;
      sortDirection?: "Asc" | "Desc";
      size?: number;
    }) => {
      if (!handler || typeof handler !== "function") return;
      if (isRequestInProgress) return; // Prevent multiple simultaneous requests

      setIsRequestInProgress(true);
      setLoading(true);
      setError(null);

      try {
        const params: PaginationData = {
          PageNumber: overrideParams?.page ?? currentPage,
          PageSize: overrideParams?.size ?? effectiveSettings.pageSize,
          Filter: overrideParams?.search ?? (searchTerm || undefined),
          Order:
            overrideParams?.sortBy ?? effectiveSettings.sortBy
              ? `${overrideParams?.sortBy ?? effectiveSettings.sortBy};${
                  overrideParams?.sortDirection ??
                  effectiveSettings.sortDirection
                }`
              : undefined,
        };

        console.log("fetchData called with params:", params);
        console.log("currentPage in fetchData:", params.PageNumber);

        const response = await handler(params);

        if (response && response.Data) {
          setData(response.Data);
          setTotalItems(response.Count || 0);
          setError(null);
        } else {
          setData([]);
          setTotalItems(0);
          setError("No data received from server");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch data";
        console.error("Error fetching table data:", error);

        setData([]);
        setTotalItems(0);
        setError(errorMessage);

        // Show error toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsRequestInProgress(false);
      }
    },
    [
      handler,
      currentPage,
      effectiveSettings.pageSize,
      effectiveSettings.sortBy,
      effectiveSettings.sortDirection,
      searchTerm,
      isRequestInProgress,
      toast,
    ]
  );

  // Fetch data when dependencies change
  useEffect(() => {
    if (handler) {
      // Always fetch data when handler is available and dependencies change
      fetchData();
    } else if (staticData) {
      setData(staticData);
      setTotalItems(staticData.length);
    }
  }, [
    handler,
    staticData,
    currentPage,
    effectiveSettings.pageSize,
    effectiveSettings.sortBy,
    effectiveSettings.sortDirection,
    searchTerm,
  ]);

  // Internal search handler
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      setCurrentPage(1);

      if (externalOnSearch) {
        externalOnSearch("", value);
      }

      // Use fetchData with override parameters to get immediate results with correct values
      if (handler) {
        fetchData({ page: 1, search: value });
      }
    },
    [externalOnSearch, handler, fetchData]
  );

  // Advanced search handler
  const handleAdvancedSearch = useCallback(
    (filters: SearchFilter[]) => {
      setSearchFilters(filters);
      setCurrentPage(1);

      if (onAdvancedSearch) {
        onAdvancedSearch(filters);
      }

      // Convert filters to search term for backend compatibility
      const searchTermFromFilters = filters
        .map((filter) => filter.value)
        .join(" ");
      setSearchTerm(searchTermFromFilters);

      // Use fetchData with override parameters to get immediate results
      if (handler) {
        fetchData({ page: 1, search: searchTermFromFilters });
      }
    },
    [onAdvancedSearch, handler, fetchData]
  );

  // Delete handlers
  const handleDeleteClick = useCallback((item: T) => {
    setItemToDelete(item);
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete || !removeItemHandler) return;

    setIsDeleting(true);
    try {
      const itemId = itemToDelete[idField] as string | number;
      const response = await removeItemHandler([itemId]);

      // Check if response is an API response with Succeeded property
      if (response && typeof response === "object" && "Succeeded" in response) {
        const apiResponse = response as IApiResponse<unknown>;
        if (apiResponse.Succeeded) {
          toast({
            title: "Success",
            description: "Item deleted successfully.",
          });

          // Refresh data if using handler
          if (handler) {
            fetchData();
          }

          setShowDeleteConfirmation(false);
          setItemToDelete(null);
        } else {
          toast({
            title: "Error",
            description: apiResponse.Message || "Failed to delete item.",
            variant: "destructive",
          });
        }
      } else {
        // For non-API responses (direct handlers), assume success
        toast({
          title: "Success",
          description: "Item deleted successfully.",
        });

        // Refresh data if using handler
        if (handler) {
          fetchData();
        }

        setShowDeleteConfirmation(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, removeItemHandler, idField, handler, fetchData, toast]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  }, []);

    // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (!removeItemHandler || selectedItems.size === 0) return;

    setIsBulkDeleting(true);
    try {
      const selectedIds = Array.from(selectedItems);
      const response = await removeItemHandler(selectedIds);

      // Check if response is an API response with Succeeded property
      if (response && typeof response === "object" && "Succeeded" in response) {
        const apiResponse = response as IApiResponse<unknown>;
        if (apiResponse.Succeeded) {
          toast({
            title: "Success",
            description: `${selectedIds.length} item${
              selectedIds.length > 1 ? "s" : ""
            } deleted successfully.`,
          });

          // Clear selection
          setSelectedItems(new Set());

          // Refresh data if using handler
          if (handler) {
            fetchData();
          }

          if (onSelectionChange) {
            onSelectionChange([]);
          }
        } else {
          toast({
            title: "Error",
            description:
              apiResponse.Message || "Failed to delete selected items.",
            variant: "destructive",
          });
        }
      } else {
        // For non-API responses (direct handlers), assume success
        toast({
          title: "Success",
          description: `${selectedIds.length} item${
            selectedIds.length > 1 ? "s" : ""
            } deleted successfully.`,
        });

        // Clear selection
        setSelectedItems(new Set());

        // Refresh data if using handler
        if (handler) {
          fetchData();
        }

        if (onSelectionChange) {
          onSelectionChange([]);
        }
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteConfirmation(false);
    }
  }, [
    removeItemHandler,
    selectedItems,
    handler,
    fetchData,
    onSelectionChange,
    toast,
  ]);

  // Bulk delete confirmation handler
  const handleBulkDeleteConfirm = useCallback(() => {
    handleBulkDelete();
  }, [handleBulkDelete]);

  // Bulk delete cancel handler
  const handleBulkDeleteCancel = useCallback(() => {
    setShowBulkDeleteConfirmation(false);
  }, []);

  // Internal page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      console.log("handlePageChange called with page:", page);
      console.log("Current page before change:", currentPage);
      setCurrentPage(page);

      if (externalOnPageChange) {
        externalOnPageChange(page);
      }

      // Use fetchData with override parameters to get immediate results with correct page
      if (handler) {
        fetchData({ page });
      }
    },
    [externalOnPageChange, handler, fetchData, currentPage]
  );

  // Internal settings change handler - separated for UI vs data settings
  const handleSettingsChange = useCallback(
    (newSettings: Partial<TableSettings>) => {
      const updatedSettings = { ...effectiveSettings, ...newSettings };

      if (shouldUseInternalSettings) {
        setInternalSettings(updatedSettings);
      }

      if (onSettingsChange) {
        onSettingsChange(updatedSettings);
      }

      // Only reset page for data-affecting changes (not column visibility)
      const isDataAffectingChange =
        "sortBy" in newSettings ||
        "sortDirection" in newSettings ||
        "pageSize" in newSettings;

      if (isDataAffectingChange) {
        setCurrentPage(1);

        // Use fetchData with override parameters to get immediate results with correct values
        if (handler) {
          fetchData({
            page: 1,
            sortBy: updatedSettings.sortBy,
            sortDirection: updatedSettings.sortDirection,
            size: updatedSettings.pageSize,
          });
        }
      }
    },
    [
      effectiveSettings,
      shouldUseInternalSettings,
      onSettingsChange,
      handler,
      fetchData,
    ]
  );

  // Handle sorting
  const handleSort = useCallback(
    (columnKey: string) => {
      const newSortDirection =
        effectiveSettings.sortBy === columnKey &&
        effectiveSettings.sortDirection === "Asc"
          ? "Desc"
          : "Asc";

      handleSettingsChange({
        sortBy: columnKey,
        sortDirection: newSortDirection,
      });
    },
    [
      effectiveSettings.sortBy,
      effectiveSettings.sortDirection,
      handleSettingsChange,
    ]
  );

  // Handle selection
  const handleSelectionChange = useCallback(
    (newSelectedItems: Set<string | number>) => {
      setSelectedItems(newSelectedItems);

      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelectedItems));
      }
    },
    [onSelectionChange]
  );

  const toggleSelectItem = useCallback(
    (itemId: string | number) => {
      const newSelection = new Set(selectedItems);
      if (selectedItems.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      handleSelectionChange(newSelection);
    },
    [selectedItems, handleSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    const allIds = data.map((item) => item[idField] as string | number);
    const newSelection = new Set<string | number>();

    if (selectedItems.size !== allIds.length) {
      allIds.forEach((id) => newSelection.add(id));
    }

    handleSelectionChange(newSelection);
  }, [data, idField, selectedItems.size, handleSelectionChange]);

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      const columnVisible = effectiveSettings.columns[column.key];
      return columnVisible !== false && column.visible !== false;
    });
  }, [columns, effectiveSettings.columns]);

  // Enhanced actions with automatic delete action
  const enhancedActions = useMemo(() => {
    const baseActions = actions || [];

    if (canDelete && removeItemHandler) {
      // Check if delete action already exists
      const hasDeleteAction = baseActions.some(
        (action) => action.label === "Delete" || action.label === "delete"
      );

      if (!hasDeleteAction) {
        const deleteAction: TableAction<T> = {
          label: "Delete",
          icon: "trash",
          onClick: handleDeleteClick,
          variant: "destructive",
          separator: true,
        };

        return [...baseActions, deleteAction];
      }
    }

    return baseActions;
  }, [actions, canDelete, removeItemHandler, handleDeleteClick]);

  // Enhanced bulk actions with delete
  const enhancedBulkActions = useMemo(() => {
    const baseBulkActions = bulkActions || [];

    if (canDelete && removeItemHandler) {
      // Check if delete action already exists
      const hasDeleteAction = baseBulkActions.some(
        (action) => action.value === "delete"
      );

      if (!hasDeleteAction) {
        const deleteBulkAction: BulkAction = {
          value: "delete",
          label: "Delete Selected",
          variant: "destructive",
        };

        return [...baseBulkActions, deleteBulkAction];
      }
    }

    return baseBulkActions;
  }, [bulkActions, canDelete, removeItemHandler]);

  // Enhanced bulk action handler
  const handleEnhancedBulkAction = useCallback(
    (action: string, selectedIds: (string | number)[]) => {
      if (action === "delete" && canDelete && removeItemHandler) {
        setShowBulkDeleteConfirmation(true);
      } else if (onBulkAction) {
        onBulkAction(action, selectedIds);
      }
    },
    [canDelete, removeItemHandler, onBulkAction]
  );

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / effectiveSettings.pageSize);
  const isLoading = loading || externalLoading;

  // Table skeleton loader component
  const TableSkeletonLoader = () => (
    <div className={className}>
      {/* Table Actions Skeleton */}
      {showTableActions && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="relative overflow-hidden rounded-md border">
        <div className="overflow-x-auto overflow-y-visible w-full">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left w-16">
                    <Skeleton className="h-4 w-4" />
                  </th>
                )}
                <th className="px-6 py-3 text-left w-20">
                  <Skeleton className="h-4 w-8" />
                </th>
                {visibleColumns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left"
                    style={{ width: column.width || "150px" }}
                  >
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </th>
                ))}
                {enhancedActions && enhancedActions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"></th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: effectiveSettings.pageSize || 10 }).map(
                (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {selectable && (
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    {visibleColumns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 overflow-hidden"
                        style={{ width: column.width || "150px" }}
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          {Math.random() > 0.6 && (
                            <Skeleton className="h-3 w-3/4" />
                          )}
                        </div>
                      </td>
                    ))}
                    {enhancedActions && enhancedActions.length > 0 && (
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-8 rounded" />
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between p-4 border-t">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <TableSkeletonLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Data
        </h3>
        {/* <p className="text-gray-500 mb-4">{error}</p> */}
        <Button
          variant="outline"
          onClick={() => fetchData()}
          disabled={isRequestInProgress}
        >
          {isRequestInProgress ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Data Found
        </h3>
        <p className="text-gray-500">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Enhanced Table Actions */}
      {showTableActions && (
        <NcTableActions
          selectedIds={Array.from(selectedItems)}
          bulkActions={enhancedBulkActions}
          onBulkAction={handleEnhancedBulkAction}
          exportOptions={exportOptions}
          onExport={onExport}
          createAction={createAction}
          importActions={importActions}
          onSearchToggle={
            showAdvancedSearch
              ? () => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)
              : undefined
          }
          searchComponent={
            showAdvancedSearch ? (
              <NcTableSearch
                columns={columns}
                onSearchApplied={handleAdvancedSearch}
                isSearchOpen={isAdvancedSearchOpen}
                setIsSearchOpen={setIsAdvancedSearchOpen}
              />
            ) : undefined
          }
          settingsComponent={
            enableInternalSettings ? (
              <NcTableSettings
                columns={columns}
                settings={effectiveSettings}
                onSettingsChange={handleSettingsChange}
                trigger={
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                }
              />
            ) : undefined
          }
        />
      )}

      {/* Table */}
      <div className="relative overflow-hidden rounded-md border">
        <div className="overflow-x-auto overflow-y-visible w-full">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    <Checkbox
                      checked={
                        data.length > 0 && selectedItems.size === data.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {/* Serial Number Column */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  SNO
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort(column.key)}
                    style={{ width: column.width || "150px" }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {effectiveSettings.sortBy === column.key && (
                        <span className="text-blue-600">
                          {effectiveSettings.sortDirection === "Asc"
                            ? "↑"
                            : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {enhancedActions && enhancedActions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"></th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => {
                const itemId = item[idField] as string | number;
                const serialNumber =
                  (currentPage - 1) * effectiveSettings.pageSize + index + 1;
                return (
                  <tr
                    key={itemId || index}
                    className={`hover:bg-gray-50 ${
                      selectedItems.has(itemId) ? "bg-blue-50" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedItems.has(itemId)}
                          onCheckedChange={() => toggleSelectItem(itemId)}
                          aria-label={`Select row ${index}`}
                        />
                      </td>
                    )}
                    {/* Serial Number Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {serialNumber}
                    </td>
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 text-sm text-gray-900 overflow-hidden"
                        style={{ width: column.width || "150px" }}
                      >
                        <div className="truncate">
                          {column.render
                            ? column.render(item)
                            : String(item[column.key] || "")}
                        </div>
                      </td>
                    ))}
                    {enhancedActions && enhancedActions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                            {/* <DropdownMenuSeparator /> */}
                            {enhancedActions.map((action, actionIndex) => (
                              <div key={actionIndex}>
                                {action.separator && <DropdownMenuSeparator />}
                                <DropdownMenuItem
                                  onClick={() => action.onClick(item)}
                                  className={`py-2 text-sm ${
                                    action.variant === "destructive"
                                      ? "text-red-600"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {action.icon && (
                                    <span className="mr-3 h-4 w-4 text-secondary-foreground/70">
                                      {typeof action.icon === "string" ? (
                                        <Icon name={action.icon} />
                                      ) : (
                                        action.icon
                                      )}
                                    </span>
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                              </div>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {showPagination && enableInternalPagination && totalItems > 0 && (
        <NcTablePagination
          totalItems={totalItems}
          pageSize={effectiveSettings.pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          {...paginationProps}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={showBulkDeleteConfirmation}
        onOpenChange={setShowBulkDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} selected item{selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleBulkDeleteCancel}
              disabled={isBulkDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? "Deleting..." : "Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NcTable;
