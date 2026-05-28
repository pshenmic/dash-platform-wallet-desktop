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

// Fallback provider. CryptoCompare uses uppercase ticker symbols and may
// return 200 OK with {Response: "Error", ...} on failure, so we have to
// detect that explicitly.
export class CryptoCompareRateProvider implements RateProvider {
  readonly name = 'cryptocompare'
  private readonly url = `https://min-api.cryptocompare.com/data/price?fsym=DASH&tsyms=${SUPPORTED_CURRENCIES.map(c => c.toUpperCase()).join(',')}`

  async fetchRates(): Promise<Rates> {
    const response = await net.fetch(this.url)

    if (!response.ok) {
      throw new Error(`CryptoCompare HTTP ${response.status}`)
    }

    const data = await response.json() as Partial<Record<string, number>> & {Response?: string, Message?: string}

    if (data.Response === 'Error') {
      throw new Error(`CryptoCompare: ${data.Message ?? 'unknown error'}`)
    }

    const rates: Rates = {}

    for (const c of SUPPORTED_CURRENCIES) {
      const v = data[c.toUpperCase()]
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
      : [new CoinGeckoRateProvider(), new CryptoCompareRateProvider()]
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
    // Fresh cache — serve immediately, without hitting the network.
    if (this.cache != null && this.isFresh(this.cache)) {
      return this.cache.rates
    }

    // Stale cache — refresh (parallel callers collapse onto a single request).
    return (await this.refresh()).rates
  }

  private isFresh(cache: RateCache): boolean {
    return Date.now() - cache.fetchedAt < this.ttlMs
  }

  private refresh(): Promise<RateCache> {
    // Single-flight: if a refresh is already running, join it instead of
    // firing a second network request.
    if (this.inflight != null) {
      return this.inflight
    }

    this.inflight = this.fetchFromProviders()
    this.inflight.finally(() => { this.inflight = null })

    return this.inflight
  }

  private async fetchFromProviders(): Promise<RateCache> {
    const errors: string[] = []

    // Try providers in order, take the first one with a non-empty response.
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

    // Reached only when every provider failed or returned empty rates.
    throw new Error(`All rate providers failed: ${errors.join('; ')}`)
  }
}
