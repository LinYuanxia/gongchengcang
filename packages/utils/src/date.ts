import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format)
}

export function formatTime(date: string | Date, format: string = 'HH:mm:ss'): string {
  return dayjs(date).format(format)
}

export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function getDayStart(date: string | Date = new Date()): Date {
  return dayjs(date).startOf('day').toDate()
}

export function getDayEnd(date: string | Date = new Date()): Date {
  return dayjs(date).endOf('day').toDate()
}

export function getMonthStart(date: string | Date = new Date()): Date {
  return dayjs(date).startOf('month').toDate()
}

export function getMonthEnd(date: string | Date = new Date()): Date {
  return dayjs(date).endOf('month').toDate()
}

export function addDays(date: string | Date, days: number): Date {
  return dayjs(date).add(days, 'day').toDate()
}

export function subtractDays(date: string | Date, days: number): Date {
  return dayjs(date).subtract(days, 'day').toDate()
}

export function diffDays(date1: string | Date, date2: string | Date): number {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

export function isBefore(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isBefore(dayjs(date2))
}

export function isAfter(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isAfter(dayjs(date2))
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}
