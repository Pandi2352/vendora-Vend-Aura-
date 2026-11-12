export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | null;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[] | Record<string, unknown>;
  errorCode?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  tenantId?: string;
  outletIds?: string[];
  shopId?: string;
  fullName?: string;
  isTemporaryPassword?: boolean;
  isPlatformAdmin?: boolean;
}

