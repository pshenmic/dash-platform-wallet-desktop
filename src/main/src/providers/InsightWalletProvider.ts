import {Transaction, Script, Block} from 'dash-core-sdk'
import { UTXO } from '../types/UTXO'
import { WalletProvider } from './WalletProvider'
import { Network } from '../types'
import {TransactionWalletProviderJSON} from "./types";

const BASE_URLS: Record<Network, string> = {
  mainnet: 'https://insight.dash.org/insight-api',
  testnet: 'https://insight.testnet.networks.dash.org/insight-api'
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

  async sendRequest(url: string, params?: RequestInit): Promise<Response> {
    const response = await fetch(url, params)

    if (!response.ok) {
      throw new Error(`Insight API error: ${response.status}`)
    }

    return response
  }

  async getTransactions(address: string): Promise<TransactionWalletProviderJSON[]> {
    const response = await this.sendRequest(`${this.baseUrl}/txs/?address=${address}`)


    const data = await response.json() as { txs: TransactionWalletProviderJSON [] }

    return data.txs.map((tx: TransactionWalletProviderJSON) => tx)
  }

  async getBalance(address:string | string[]): Promise<bigint> {
    const endpoint = Array.isArray(address) ? 'addrs' : 'addr'
    const parameter = Array.isArray(address) ? address.join(','): address

    const response = await this.sendRequest(`${this.baseUrl}/${endpoint}/${parameter}/balance`)

    const data = await response.text()

    return BigInt(data)
  }

  async getTransactionByHash(txId: string): Promise<Transaction> {
    const response = await this.sendRequest(`${this.baseUrl}/rawtx/${txId}`)

    const data = await response.json() as {rawtx: string }

    return Transaction.fromHex(data.rawtx)
  }

  async getBlockByHash(hash: string): Promise<Block> {
    const response = await this.sendRequest(`${this.baseUrl}/rawblock/${hash}`)

    const data = await response.json() as {rawblock: string }

    return Block.fromHex(data.rawblock)
  }

  async getUTXOs(address: string): Promise<UTXO[]> {
    const response = await this.sendRequest(`${this.baseUrl}/addr/${address}/utxo`)

    const data = await response.json() as InsightUTXO[]

    return data.map((utxo) => ({
      txId: utxo.txid,
      vOut: utxo.vout,
      satoshis: BigInt(utxo.satoshis),
      script: Script.fromHex(utxo.scriptPubKey)
    }))
  }

  async broadcastTx(tx: Transaction): Promise<string> {
    const response = await this.sendRequest(`${this.baseUrl}/tx/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawtx: tx.hex() })
    })

    const data = await response.json() as { txid: string }

    return data.txid
  }
}
