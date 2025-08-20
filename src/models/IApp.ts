export interface IListing {
  Id: string;
  Name: string;
}

export interface PaginationData {
  PageNumber: number;
  PageSize: number;
  Order?: string;
  Filter?: string;
}
