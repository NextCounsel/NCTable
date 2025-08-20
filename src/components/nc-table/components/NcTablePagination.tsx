import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface NcTablePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  showingLabel?: string;
  ofLabel?: string;
  recordsLabel?: string;
  recordLabel?: string;
  showFirstLast?: boolean;
  showEllipsis?: boolean;
  maxVisiblePages?: number;
  className?: string;
  compact?: boolean;
}

const NcTablePagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  showingLabel = "Showing",
  ofLabel = "of",
  recordsLabel = "Record(s)",
  recordLabel = "Record",
  showFirstLast = true,
  showEllipsis = true,
  maxVisiblePages = 5,
  className = "",
  compact = false,
}: NcTablePaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is within limit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

      // Add ellipsis after first page if needed
      if (start > 2 && showEllipsis) {
        pages.push("ellipsis");
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1 && showEllipsis) {
        pages.push("ellipsis");
      }

      // Always show last page if it's not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-2 border-t text-sm ${className}`}
      >
        <div className="text-muted-foreground">
          {startItem}-{endItem} {ofLabel} {totalItems}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-2">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-4 border-t ${className}`}
    >
      <div className="flex items-center gap-4">
        <Pagination>
          <PaginationContent>
            {showFirstLast && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  First
                </Button>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {visiblePages.map((page, index) => (
              <PaginationItem key={index}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {showFirstLast && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Last
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      <div className="text-right">
        <span className="text-sm text-muted-foreground">
          {showingLabel} {startItem} - {endItem} {ofLabel} {totalItems}{" "}
          {totalItems === 1 ? recordLabel : recordsLabel}
        </span>
      </div>
    </div>
  );
};

export default NcTablePagination;
