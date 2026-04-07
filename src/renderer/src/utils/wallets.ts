import type { WalletDto as ApiWalletDto } from '@renderer/api/types'

export interface WalletDropdownOption {
  value: string
  label: string
  isSelected: boolean
}

export function walletDisplayName(wallet: ApiWalletDto, index: number): string {
  const raw = wallet.label?.trim()
  return raw && raw.length > 0 ? raw : `Wallet_${index + 1}`
}
export function toDropdownOptions(wallets: ApiWalletDto[]): WalletDropdownOption[] {
  return wallets.map((w, i) => ({
    value: w.walletId,
    label: walletDisplayName(w, i),
    isSelected: w.selected,
  }))
}
