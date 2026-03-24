export interface Address {
  walletId: string
  accountId: number
  address: string
  derivationPath: string
  index: number
  isChange: boolean
  balance?: bigint | null
}
