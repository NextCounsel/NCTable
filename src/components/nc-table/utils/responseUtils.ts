import { GenericApiResponse, ResponseConfig } from "@/models/IApiResponse";

/**
 * Maps a custom API response to the standard format expected by the table
 */
export function mapResponse<T>(
  response: GenericApiResponse<T>,
  config?: ResponseConfig<T>
): {
  data: T[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
} {
  // If custom transformation function is provided, use it
  if (config?.transformResponse) {
    return config.transformResponse(response);
  }

  // Default field mappings (IApiResponse format)
  const defaultConfig = {
    dataField: "Data",
    countField: "Count",
    successField: "Succeeded",
    messageField: "Message",
    statusCodeField: "StatusCode",
    pageNumberField: "PageNumber",
    pageSizeField: "PageSize",
    totalPagesField: "TotalPages",
    ...config,
  };

  // Extract data
  const data = response[defaultConfig.dataField] || [];
  const count = response[defaultConfig.countField] || 0;
  const success = response[defaultConfig.successField] ?? true;
  const message = response[defaultConfig.messageField] || "";
  const statusCode = response[defaultConfig.statusCodeField] || 200;

  // Extract optional pagination fields
  const pageNumber = response[defaultConfig.pageNumberField];
  const pageSize = response[defaultConfig.pageSizeField];
  const totalPages = response[defaultConfig.totalPagesField];

  return {
    data: Array.isArray(data) ? data : [],
    count: typeof count === "number" ? count : 0,
    success: Boolean(success),
    message: String(message),
    statusCode: typeof statusCode === "number" ? statusCode : 200,
    pageNumber: typeof pageNumber === "number" ? pageNumber : undefined,
    pageSize: typeof pageSize === "number" ? pageSize : undefined,
    totalPages: typeof totalPages === "number" ? totalPages : undefined,
  };
}

/**
 * Creates a response config for common API response formats
 */
export const CommonResponseFormats = {
  // Standard IApiResponse format (default)
  standard: {} as ResponseConfig,

  // REST API with different field names
  restApi: {
    dataField: "data",
    countField: "total",
    successField: "success",
    messageField: "message",
    statusCodeField: "status",
  } as ResponseConfig,

  // GraphQL style response
  graphql: {
    dataField: "data.items",
    countField: "data.totalCount",
    successField: "success",
    messageField: "message",
    statusCodeField: "statusCode",
  } as ResponseConfig,

  // Laravel API Resource format
  laravel: {
    dataField: "data",
    countField: "meta.total",
    successField: "success",
    messageField: "message",
    statusCodeField: "status",
  } as ResponseConfig,

  // Django REST Framework format
  django: {
    dataField: "results",
    countField: "count",
    successField: "success",
    messageField: "message",
    statusCodeField: "status",
  } as ResponseConfig,
};
