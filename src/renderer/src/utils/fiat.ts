const DUFFS_PER_DASH = 100_000_000

export const SUPPORTED_FIAT = ['usd', 'eur', 'btc', 'rub'] as const

export type FiatCurrency = (typeof SUPPORTED_FIAT)[number]

export const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  eur: '€',
  btc: '₿',
  rub: '₽',
}

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toLowerCase()] ?? ''
}

export function duffsToDashNumber(duffs: bigint): number {
  return Number(duffs) / DUFFS_PER_DASH
}

export function convertDuffsToFiat(duffs: bigint, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0
  return duffsToDashNumber(duffs) * rate
}

export function fiatFractionDigits(currency: string): number {
  return currency.toLowerCase() === 'btc' ? 8 : 2
}

export function formatFiatAmount(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return '0'
  const digits = fiatFractionDigits(currency)
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

export function formatFiat(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${formatFiatAmount(amount, currency)}`
}

export function formatDuffsAsFiat(duffs: bigint, rate: number, currency: string): string {
  return formatFiat(convertDuffsToFiat(duffs, rate), currency)
}
