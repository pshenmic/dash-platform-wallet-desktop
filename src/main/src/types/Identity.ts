export interface Identity {
  walletId: string
  identityIndex: number
  derivationPath: string
  identifier: string
}

export interface IdentityInfo {
  identityIndex: number
  identifier: string
  balance: string
  derivationPath: string
}
