export function formatMoney(amount: number, precision: number = 2): string {
  return amount.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatNumber(num: number, precision: number = 0): string {
  return num.toFixed(precision)
}

export function formatPercent(value: number, precision: number = 2): string {
  return (value * 100).toFixed(precision) + '%'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

export function formatBankCard(card: string): string {
  if (!card) return card
  return card.replace(/(\d{4})/g, '$1 ').trim()
}

export function formatIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1********$2')
}
