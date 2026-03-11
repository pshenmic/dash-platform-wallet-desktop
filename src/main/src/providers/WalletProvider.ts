import { Transaction } from 'dash-core-sdk'
import { UTXO } from '../types/UTXO'

export interface WalletProvider {
  getTransactions(address: string): Promise<Transaction[]>
  getUTXOs(address: string): Promise<UTXO[]>
  broadcastTx(tx: Transaction): Promise<string>
  getBalance(address: string): Promise<number>
}
