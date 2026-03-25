export interface Address {
  walletId: string
  accountId: number
  address: string
  derivationPath: string
  index: number
  isChange: boolean
  label: string | null
  balance?: bigint | null
}
