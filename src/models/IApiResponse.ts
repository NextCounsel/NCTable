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
