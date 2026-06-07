import { describe, it, expect } from 'vitest'
import {
  convertDuffsToFiat,
  duffsToDashNumber,
  formatFiat,
  formatFiatAmount,
  formatDuffsAsFiat,
  currencySymbol,
  fiatFractionDigits,
} from '../../src/renderer/src/utils/fiat'

const ONE_DASH = 100_000_000n

describe('duffsToDashNumber', () => {
  it('converts duffs to a dash number', () => {
    expect(duffsToDashNumber(ONE_DASH)).toBe(1)
    expect(duffsToDashNumber(ONE_DASH / 2n)).toBe(0.5)
    expect(duffsToDashNumber(0n)).toBe(0)
  })
})

describe('convertDuffsToFiat', () => {
  it('multiplies dash value by the rate', () => {
    expect(convertDuffsToFiat(ONE_DASH, 30)).toBe(30)
    expect(convertDuffsToFiat(ONE_DASH * 2n, 25.5)).toBe(51)
  })

  it('returns 0 for non-positive or invalid rates', () => {
    expect(convertDuffsToFiat(ONE_DASH, 0)).toBe(0)
    expect(convertDuffsToFiat(ONE_DASH, -5)).toBe(0)
    expect(convertDuffsToFiat(ONE_DASH, Number.NaN)).toBe(0)
    expect(convertDuffsToFiat(ONE_DASH, Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('returns 0 for a zero balance', () => {
    expect(convertDuffsToFiat(0n, 30)).toBe(0)
  })
})

describe('currencySymbol', () => {
  it('maps known currencies and is case-insensitive', () => {
    expect(currencySymbol('usd')).toBe('$')
    expect(currencySymbol('EUR')).toBe('€')
    expect(currencySymbol('btc')).toBe('₿')
    expect(currencySymbol('rub')).toBe('₽')
  })

  it('returns empty string for unknown currencies', () => {
    expect(currencySymbol('xyz')).toBe('')
  })
})

describe('fiatFractionDigits', () => {
  it('uses 8 digits for btc and 2 otherwise', () => {
    expect(fiatFractionDigits('btc')).toBe(8)
    expect(fiatFractionDigits('usd')).toBe(2)
    expect(fiatFractionDigits('eur')).toBe(2)
  })
})

describe('formatFiatAmount', () => {
  it('formats fiat with grouping and two decimals', () => {
    expect(formatFiatAmount(1234.5, 'usd')).toBe('1,234.50')
    expect(formatFiatAmount(0, 'usd')).toBe('0.00')
  })

  it('formats btc with eight decimals', () => {
    expect(formatFiatAmount(0.12345678, 'btc')).toBe('0.12345678')
  })

  it('handles invalid amounts', () => {
    expect(formatFiatAmount(Number.NaN, 'usd')).toBe('0')
  })
})

describe('formatFiat', () => {
  it('prefixes the currency symbol', () => {
    expect(formatFiat(30, 'usd')).toBe('$30.00')
    expect(formatFiat(1234.5, 'eur')).toBe('€1,234.50')
  })
})

describe('formatDuffsAsFiat', () => {
  it('converts and formats in one step', () => {
    expect(formatDuffsAsFiat(ONE_DASH * 3n, 20, 'usd')).toBe('$60.00')
    expect(formatDuffsAsFiat(0n, 20, 'usd')).toBe('$0.00')
  })
})
