export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ApiErrorResponse {
  code: number
  message: string
  errors?: Record<string, string[]>
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: SelectOption[]
}

export interface TreeOption {
  key: string
  title: string
  value: string
  children?: TreeOption[]
}

export interface UploadFile {
  uid: string
  name: string
  url: string
  status: 'uploading' | 'done' | 'error'
  size?: number
  type?: string
}

export interface Address {
  province: string
  provinceCode: string
  city: string
  cityCode: string
  district: string
  districtCode: string
  detail: string
  longitude?: number
  latitude?: number
}

export interface TimeRange {
  startTime: string
  endTime: string
}
