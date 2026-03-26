import {Block, Transaction} from 'dash-core-sdk'
import { UTXO } from '../types/UTXO'
import {TransactionWalletProviderJSON} from "./types";

export interface WalletProvider {
  getTransactions(address: string): Promise<TransactionWalletProviderJSON[]>
  getBalance(address: string | string[]): Promise<bigint>
  getTransactionByHash(txId: string): Promise<TransactionWalletProviderJSON>
  getBlockByHash(hash: string): Promise<Block>
  getUTXOs(address: string): Promise<UTXO[]>
  broadcastTx(tx: Transaction): Promise<string>
}
