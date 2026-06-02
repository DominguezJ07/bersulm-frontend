import { describe, it, expect } from 'vitest'
import { formatCurrency, formatISODate, truncateName, isPastDay } from '@/lib/format'

describe('formatCurrency', () => {
  it('formats number with dollar sign', () => {
    expect(formatCurrency(25)).toBe('$25')
  })

  it('formats string number', () => {
    expect(formatCurrency('40')).toBe('$40')
  })

  it('returns dash for undefined', () => {
    expect(formatCurrency(undefined)).toBe('-')
  })

  it('returns dash for null', () => {
    // @ts-expect-error - testing null
    expect(formatCurrency(null)).toBe('-')
  })
})

describe('formatISODate', () => {
  it('formats date to ISO string date part', () => {
    const date = new Date('2026-06-01')
    expect(formatISODate(date)).toBe('2026-06-01')
  })

  it('returns null for null date', () => {
    expect(formatISODate(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(formatISODate(undefined)).toBeNull()
  })
})

describe('truncateName', () => {
  it('truncates long names', () => {
    expect(truncateName('Jonathan', 5)).toBe('Jonat')
  })

  it('keeps short names as is', () => {
    expect(truncateName('Ana', 8)).toBe('Ana')
  })

  it('uses default max length of 8', () => {
    expect(truncateName('Christopher')).toBe('Christop')
  })
})

describe('isPastDay', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isPastDay(yesterday)).toBe(true)
  })

  it('returns false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isPastDay(tomorrow)).toBe(false)
  })
})
