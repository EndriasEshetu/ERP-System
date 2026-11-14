/**
 * Standard API error detail item.
 */
export interface ApiErrorItem {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Standard successful API response envelope.
 */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standard error API response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorItem[];
}

/**
 * Pagination metadata.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated data envelope.
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Paginated API response.
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

