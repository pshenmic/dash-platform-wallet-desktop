import { Script } from 'dash-core-sdk'

export interface UTXO {
  satoshis: bigint
  script: Script
  txId: string
  vOut: number
}
