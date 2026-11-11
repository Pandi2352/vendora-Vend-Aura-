/** Server response envelope (see server TransformResponseInterceptor). */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta: PaginationMeta | null;
  timestamp: string;
  path: string;
  requestId?: string;
}

/** Server error body (see server GlobalHttpExceptionFilter). */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[] | Record<string, unknown>;
  errorCode?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta | null;
}
