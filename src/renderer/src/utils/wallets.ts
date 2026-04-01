export type WalletDto = {
  walletId: string
  name?: string | null
  network?: string | null
  isDefault?: boolean
}

export function walletDisplayName(wallet: WalletDto, index: number): string {
  const raw = wallet.name?.trim()
  return raw && raw.length > 0 ? raw : `Wallet_${index + 1}`
}

export function toDropdownOptions(wallets: WalletDto[]) {
  return wallets.map((w, i) => ({
    value: w.walletId,
    label: walletDisplayName(w, i),
    description: w.isDefault ? 'Default' : (w.network ?? ''),
  }))
}
