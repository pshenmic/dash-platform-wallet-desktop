import {AmountWithUsd} from "./WalletBalance";

export interface Identity {
  walletId: string
  identityIndex: number
  derivationPath: string
  identifier: string
}

export interface IdentityInfo {
  identityIndex: number
  identifier: string
  alias: string | null
  creationDate: string | null
  balance: AmountWithUsd
  derivationPath: string
}
