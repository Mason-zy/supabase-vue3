// 分页参数接口
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页结果接口
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 基础实体接口
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// 排序参数
export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// 过滤参数
export interface FilterParams {
  field: string
  value: string | number | boolean
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like'
} 