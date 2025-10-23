export interface IApiResponse<T> {
  PageNumber?: number;
  PageSize?: number;
  FirstPage?: string;
  LastPage?: string;
  TotalPages?: number;
  NextPage?: string;
  PreviousPage?: string;
  Succeeded: boolean;
  Message: string;
  Data: T;
  Count: number;
  StatusCode: number;
}

// Generic API response interface for custom backend formats
export interface GenericApiResponse<T> {
  [key: string]: any; // Allow any properties for flexibility
}

// Configuration for mapping custom response fields to standard format
export interface ResponseConfig<T = any> {
  // Field mappings for custom response structure
  dataField?: string; // Field name containing the data array (default: "Data")
  countField?: string; // Field name containing total count (default: "Count")
  successField?: string; // Field name indicating success (default: "Succeeded")
  messageField?: string; // Field name containing message (default: "Message")
  statusCodeField?: string; // Field name containing status code (default: "StatusCode")

  // Optional field mappings for pagination
  pageNumberField?: string; // Field name for current page (default: "PageNumber")
  pageSizeField?: string; // Field name for page size (default: "PageSize")
  totalPagesField?: string; // Field name for total pages (default: "TotalPages")

  // Custom transformation functions
  transformResponse?: (response: GenericApiResponse<T>) => {
    data: T[];
    count: number;
    success: boolean;
    message: string;
    statusCode: number;
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
  };
}
