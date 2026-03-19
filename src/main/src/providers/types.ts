export interface InputWalletProviderJSON {
  txid: string,
  vout: number,
  sequence: number,
  n: number,
  scriptSig: {
    hex: string,
    asm: string
  },
  addr: string,
  valueSat: number,
  value: number,
}

export interface OutputWalletProviderJSON {
  value: string,
  n: number,
  scriptPubKey: {
    hex: string,
    asm: string,
    addresses: string[],
    type: string
  },
  spentTxId: string,
  spentIndex: number,
  spentHeight: number
}

export interface TransactionWalletProviderJSON {
  txid: string,
  version: number,
  locktime: number,
  vin: InputWalletProviderJSON[],
  vout: OutputWalletProviderJSON[],
  blockHash: string,
  blockHeight: number,
  confirmations: number,
  time: number,
  blockTime: number,
  valueOut: number,
  size: number,
  valueIn: number,
  fees: number,
  txLock: boolean,
}
