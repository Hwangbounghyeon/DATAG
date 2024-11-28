// 모든 응답에 대해서 return해야 하는 타입

export type DefaultResponseType<T> = {
  status: number;
  data?: T;
  error?: string;
};

// Pagination Type
export type PaginationType<T> = {
  data: T;
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
};

// DefaultResponseType + PaginationType
export type DefaultPaginationType<T> = DefaultResponseType<PaginationType<T>>;
