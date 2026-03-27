import {TransactionStatus} from "../enums/TransactionStatus";
import {InputWalletProviderJSON, OutputWalletProviderJSON} from "../providers/types";

export interface Transaction {
  address: string
  direction: number
  inAmount: bigint
  outAmount: bigint
  transferAmount: bigint
  usdAmount: string
  date: Date
  status: keyof typeof TransactionStatus
  walletId: string
  confirmations: number
  txid: string
  vin: InputWalletProviderJSON[]
  vout: OutputWalletProviderJSON[]
}
