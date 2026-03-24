export interface AmountWithUsd {
  amount: bigint,
  usdAmount: string,
}

export interface WalletBalance {
  dash: AmountWithUsd
  credits: AmountWithUsd
}
