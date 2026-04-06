// getAddresses
export type WalletAddressDto = {
  walletId: string
  accountId: number
  address: string
  derivationPath: string
  index: number
  isChange: number
  balance: bigint
  label: string | null
  usdBalance: string | null
}
export type GetAddressesResponse = {
  receiving: WalletAddressDto[]
  change: WalletAddressDto[]
}

// getStatus
export type Network = 'mainnet' | 'testnet'

export interface AppStatus {
  ready: boolean
  selectedWalletId: string | null
  network: Network | null
}

// getAllWallets
export interface WalletDto {
  walletId: string
  network: Network
  selected: boolean
  label?: string | null
  encryptedMnemonic?: string
}
