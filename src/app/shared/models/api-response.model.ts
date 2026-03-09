export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message?: string;
}

export interface PagingResponse<T> {
  data: T[];
  total: number;
}
