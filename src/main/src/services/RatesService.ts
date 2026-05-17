import {net} from 'electron'

export type FiatCurrency = 'usd' | 'btc' | 'rub'

interface RateCache {
  rates: Record<FiatCurrency, number>
  fetchedAt: number
}

const DEFAULT_TTL_MS = 60_000
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=dash&vs_currencies=usd,btc,rub'

// CoinGecko returns all 3 currencies in one call — cached together under a
// single fetchedAt timestamp. `inflight` deduplicates concurrent refreshes
// (e.g. getWalletBalance + getAddresses firing in parallel after cache miss).
export class RatesService {
  private cache: RateCache | null = null
  private inflight: Promise<RateCache> | null = null
  private readonly ttlMs: number

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs
  }

  async getRate(currency: FiatCurrency): Promise<number> {
    return (await this.getRates())[currency]
  }

  async getRates(): Promise<Record<FiatCurrency, number>> {
    const cached = this.cache
    if (cached && Date.now() - cached.fetchedAt < this.ttlMs) {
      return cached.rates
    }
    return (await this.refresh()).rates
  }

  private async refresh(): Promise<RateCache> {
    if (this.inflight) return this.inflight
    this.inflight = this.fetchRates().finally(() => {
      this.inflight = null
    })
    return this.inflight
  }

  private async fetchRates(): Promise<RateCache> {
    const response = await net.fetch(COINGECKO_URL)
    if (!response.ok) {
      throw new Error(`CoinGecko HTTP ${response.status}`)
    }
    const data = await response.json() as {dash?: Partial<Record<FiatCurrency, number>>}
    const {usd, btc, rub} = data.dash ?? {}
    if (usd == null || btc == null || rub == null) {
      throw new Error('CoinGecko response missing dash rates')
    }
    this.cache = {
      rates: {usd, btc, rub},
      fetchedAt: Date.now(),
    }
    return this.cache
  }
}
