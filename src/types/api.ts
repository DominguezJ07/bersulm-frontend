export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    limit: number
  }
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}
