import type { ApiResponse, PaginationParams, PaginationResult } from '@gongchengcang/types'

interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  timeout?: number
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TIMEOUT = 30000

async function request<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const { params, timeout = TIMEOUT, ...init } = config
  
  let fullUrl = BASE_URL + url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    fullUrl += '?' + searchParams.toString()
  }

  const token = localStorage.getItem('gc_token')
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fullUrl, {
      ...init,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const result: ApiResponse<T> = await response.json()

    if (result.code !== 0) {
      throw new Error(result.message || '请求失败')
    }

    return result.data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  }
}

export function get<T>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
  return request<T>(url, { ...config, method: 'GET', params })
}

export function post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function del<T>(url: string, params?: Record<string, any>, config?: RequestConfig): Promise<T> {
  return request<T>(url, { ...config, method: 'DELETE', params })
}

export function upload<T>(url: string, file: File, config?: RequestConfig): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  
  const token = localStorage.getItem('gc_token')
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return request<T>(url, {
    ...config,
    method: 'POST',
    headers,
    body: formData,
  })
}

export async function getPage<T>(
  url: string,
  params: PaginationParams & Record<string, any>
): Promise<PaginationResult<T>> {
  return get<PaginationResult<T>>(url, params)
}
