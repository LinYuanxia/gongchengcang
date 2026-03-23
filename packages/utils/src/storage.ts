const TOKEN_KEY = 'gc_token'
const REFRESH_TOKEN_KEY = 'gc_refresh_token'
const USER_INFO_KEY = 'gc_user_info'
const MERCHANT_INFO_KEY = 'gc_merchant_info'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getUserInfo<T = any>(): T | null {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setUserInfo<T>(info: T): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

export function getMerchantInfo<T = any>(): T | null {
  const info = localStorage.getItem(MERCHANT_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setMerchantInfo<T>(info: T): void {
  localStorage.setItem(MERCHANT_INFO_KEY, JSON.stringify(info))
}

export function removeMerchantInfo(): void {
  localStorage.removeItem(MERCHANT_INFO_KEY)
}

export function clearAuth(): void {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
  removeMerchantInfo()
}

export function clearAll(): void {
  localStorage.clear()
}

export function getLocal<T = any>(key: string): T | null {
  const value = localStorage.getItem(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return value as unknown as T
  }
}

export function setLocal<T>(key: string, value: T): void {
  if (typeof value === 'string') {
    localStorage.setItem(key, value)
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export function removeLocal(key: string): void {
  localStorage.removeItem(key)
}
