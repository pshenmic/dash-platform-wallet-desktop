import {Block, Transaction} from 'dash-core-sdk'
import { UTXO } from '../types/UTXO'
import {TransactionWalletProviderJSON} from "./types";

export interface WalletProvider {
  getTransactions(address: string): Promise<TransactionWalletProviderJSON[]>
  getTransactionByHash(txId: string): Promise<Transaction>
  getBlockByHash(hash: string): Promise<Block>
  getUTXOs(address: string): Promise<UTXO[]>
  broadcastTx(tx: Transaction): Promise<string>
  getBalance(address: string): Promise<number>
}
