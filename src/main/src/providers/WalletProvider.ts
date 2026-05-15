import {Block, Transaction as SDKTransaction} from 'dash-core-sdk'
import {UTXO} from '../types/UTXO'
import {Transaction} from '../types/Transaction'

export interface WalletProvider {
  getTransactions(address: string): Promise<Transaction[]>
  getBalance(address: string | string[]): Promise<bigint>
  getTransactionByHash(txId: string): Promise<Transaction>
  getBlockByHash(hash: string): Promise<Block>
  getUTXOs(address: string): Promise<UTXO[]>
  broadcastTx(tx: SDKTransaction): Promise<string>
  // Returns the first address from the given set that has no on-chain history
  // — used by Receive (next unused receiving address) and change-output
  // selection. Determined by the provider, not by local DB state.
  nextUnusedAddress(addresses: string[]): Promise<string>
}