export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
