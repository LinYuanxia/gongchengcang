export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isEmail(email: string): boolean {
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)
}

export function isIdCard(idCard: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

export function isBankCard(card: string): boolean {
  return /^\d{16,19}$/.test(card)
}

export function isUrl(url: string): boolean {
  return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (isArray(value) || isString(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}
