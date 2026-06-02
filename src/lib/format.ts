export function formatSpanishDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatISODate(date: Date | null | undefined): string | null {
  if (!date) return null
  return date.toISOString().slice(0, 10)
}

export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return `$${num.toFixed(0)}`
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = Array(startDow).fill(null)
  const totalDays = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

export function isPastDay(date: Date): boolean {
  const today = new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function calculateRemainingTime(target: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const diff = target.getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function getMonthEnd(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function truncateName(name: string, maxLength = 8): string {
  return String(name).substring(0, maxLength)
}
