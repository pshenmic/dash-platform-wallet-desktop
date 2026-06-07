import { net } from 'electron'
import { SUPPORTED_RATE_CURRENCIES } from '../constants'

export type ExchangeRates = Record<string, number>

export interface ExchangeRatesResult {
  rates: ExchangeRates
  updatedAt: number | null
  stale: boolean
}

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price' +
  `?ids=dash&vs_currencies=${SUPPORTED_RATE_CURRENCIES.join(',')}`

const TTL_MS = 60_000
const REQUEST_TIMEOUT_MS = 8_000

function zeroRates(): ExchangeRates {
  return Object.fromEntries(SUPPORTED_RATE_CURRENCIES.map((c) => [c, 0]))
}

export class RatesService {
  private cache: ExchangeRates | null = null
  private fetchedAt: number | null = null
  private inflight: Promise<ExchangeRates> | null = null

  async getRates(): Promise<ExchangeRatesResult> {
    const fresh =
      this.cache !== null &&
      this.fetchedAt !== null &&
      Date.now() - this.fetchedAt < TTL_MS

    if (fresh) {
      return { rates: this.cache!, updatedAt: this.fetchedAt, stale: false }
    }

    try {
      const rates = await this.refresh()
      return { rates, updatedAt: this.fetchedAt, stale: false }
    } catch (err) {
      console.error('[rates] refresh failed:', err)
      return {
        rates: this.cache ?? zeroRates(),
        updatedAt: this.fetchedAt,
        stale: true,
      }
    }
  }

  private refresh(): Promise<ExchangeRates> {
    if (this.inflight) return this.inflight

    this.inflight = this.fetchFromUpstream()
      .then((rates) => {
        this.cache = rates
        this.fetchedAt = Date.now()
        return rates
      })
      .finally(() => {
        this.inflight = null
      })

    return this.inflight
  }

  private async fetchFromUpstream(): Promise<ExchangeRates> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await net.fetch(COINGECKO_URL, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`CoinGecko error: ${response.status}`)
      }

      const data = (await response.json()) as { dash?: Record<string, number> }
      const dash = data.dash
      if (!dash || typeof dash !== 'object') {
        throw new Error('CoinGecko response missing dash prices')
      }

      const rates = zeroRates()
      for (const currency of SUPPORTED_RATE_CURRENCIES) {
        const value = dash[currency]
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
          rates[currency] = value
        }
      }
      return rates
    } finally {
      clearTimeout(timer)
    }
  }
}
