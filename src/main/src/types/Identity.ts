export interface Identity {
  walletId: string
  identityIndex: number
  publicKeyHash: string
  derivationPath: string
}

export interface IdentityInfo {
  identityIndex: number
  identifier: string
  balance: string
  derivationPath: string
}
