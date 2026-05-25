import {net} from 'electron'
import {SUPPORTED_CURRENCIES} from '../constants'

export type FiatCurrency = typeof SUPPORTED_CURRENCIES[number]

export type Rates = Partial<Record<FiatCurrency, number>>

export interface RateProvider {
  readonly name: string
  fetchRates(): Promise<Rates>
}

interface RateCache {
  rates: Rates
  fetchedAt: number
}

const DEFAULT_TTL_MS = 60_000

export class CoinGeckoRateProvider implements RateProvider {
  readonly name = 'coingecko'
  private readonly url = `https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=${SUPPORTED_CURRENCIES.join(',')}`

  async fetchRates(): Promise<Rates> {
    const response = await net.fetch(this.url)
    if (!response.ok) {
      throw new Error(`CoinGecko HTTP ${response.status}`)
    }
    const data = await response.json() as {dash?: Partial<Record<string, number>>}
    const rates: Rates = {}
    for (const c of SUPPORTED_CURRENCIES) {
      const v = data.dash?.[c]
      if (typeof v === 'number') rates[c] = v
    }
    return rates
  }
}

// Multi-provider fallback: tries providers in order, returns first non-empty
// response. `inflight` deduplicates concurrent refreshes (e.g. getWalletBalance
// + getAddresses firing in parallel after cache miss).
export class RatesService {
  private cache: RateCache | null = null
  private inflight: Promise<RateCache> | null = null
  private readonly providers: RateProvider[]
  private readonly ttlMs: number

  constructor(providers?: RateProvider[], ttlMs: number = DEFAULT_TTL_MS) {
    this.providers = providers != null && providers.length > 0
      ? providers
      : [new CoinGeckoRateProvider()]
    this.ttlMs = ttlMs
  }

  async getRate(currency: FiatCurrency): Promise<number> {
    const rate = (await this.getRates())[currency]
    if (rate == null) {
      throw new Error(`Rate for ${currency} unavailable`)
    }
    return rate
  }

  async getRates(): Promise<Rates> {
    const cached = this.cache
    if (cached != null && Date.now() - cached.fetchedAt < this.ttlMs) {
      return cached.rates
    }
    return (await this.refresh()).rates
  }

  private async refresh(): Promise<RateCache> {
    if (this.inflight != null) return this.inflight
    this.inflight = this.fetchFromProviders().finally(() => {
      this.inflight = null
    })
    return this.inflight
  }

  private async fetchFromProviders(): Promise<RateCache> {
    const errors: string[] = []
    for (const provider of this.providers) {
      try {
        const rates = await provider.fetchRates()
        if (Object.keys(rates).length === 0) {
          errors.push(`${provider.name}: empty rates`)
          continue
        }
        this.cache = {rates, fetchedAt: Date.now()}
        return this.cache
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${provider.name}: ${msg}`)
      }
    }
    throw new Error(`All rate providers failed: ${errors.join('; ')}`)
  }
}
