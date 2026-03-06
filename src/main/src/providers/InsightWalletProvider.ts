import { Transaction, Script } from 'dash-core-sdk'
import { UTXO } from '../types/UTXO'
import { WalletProvider } from './WalletProvider'
import { Network } from '../types'

const BASE_URLS: Record<Network, string> = {
  mainnet: 'https://insight.dash.org/api',
  testnet: 'https://testnet-insight.dashevo.org/api'
}

export interface InsightUTXO {
  txid: string
  vout: number
  address: string
  scriptPubKey: string
  satoshis: number
  height: number
  confirmations: number
}

export class InsightWalletProvider implements WalletProvider {
  private baseUrl: string

  constructor(network: Network) {
    this.baseUrl = BASE_URLS[network]
  }

  async getTransactions(address: string): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/txs/?address=${address}`)

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    const data = await response.json()

    return data.txs.map((tx: { rawtx: string }) => Transaction.fromHex(tx.rawtx))
  }

  async getUTXOs(address: string): Promise<UTXO[]> {
    const response = await fetch(`${this.baseUrl}/addr/${address}/utxo`)

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    const data: InsightUTXO[] = await response.json()

    return data.map((utxo) => ({
      txId: utxo.txid,
      vOut: utxo.vout,
      satoshis: BigInt(utxo.satoshis),
      script: Script.fromHex(utxo.scriptPubKey)
    }))
  }

  async broadcastTx(tx: Transaction): Promise<string> {
    const response = await fetch(`${this.baseUrl}/tx/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawtx: tx.hex() })
    })

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    const data = await response.json()

    return data.txid
  }

  async getBalance(address: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/addr/${address}/balance`)

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    return response.json()
  }
}
