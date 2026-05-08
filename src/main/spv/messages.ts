import {Network} from '../src/types'

export interface SpvStartMessage {
  type: 'start'
  network: Network
  walletId: string
  chainDbPath: string
  startHeight: number
  startHash: string | null
  watchAddresses: string[]
  birthdayHeight?: number
}

export interface SpvStopMessage {
  type: 'stop'
}

export interface SpvAddWatchAddressesMessage {
  type: 'addWatchAddresses'
  walletId: string
  addresses: string[]
}

export type SpvCommand = SpvStartMessage | SpvStopMessage | SpvAddWatchAddressesMessage

export type SpvPhase =
  | 'idle'
  | 'connecting'
  | 'syncing-headers'
  | 'synced-headers'
  | 'syncing-cfcheckpt'
  | 'syncing-cfheaders'
  | 'syncing-cfilters'
  | 'synced'
  | 'stopped'

export interface SpvStatus {
  phase: SpvPhase
  network: Network | null
  walletId: string | null

  // Headers
  tipHeight: number
  tipHash: string | null
  // Best height advertised by any connected peer — proxy for the live chain
  // tip. Used by the renderer to compute % progress during header sync.
  estimatedChainHeight: number

  // CFilter sub-phases
  // Walk frontier: highest height with a verified filter header (cfheaders
  // walk). Lags tipHeight during cfheaders phase, equal once walk is done.
  cfheadersHeight: number
  // Scan cursor: highest height whose cfilter has been matched against the
  // wallet's watch set.
  cfilterScanHeight: number
  // Matched blocks awaiting full-block fetch (or already fetched, awaiting
  // application). Useful when scan is "stuck" waiting for a peer to deliver.
  matchedBlocksPending: number

  // Wallet
  utxoCount: number
  // Sum of all UTXOs in satoshis, serialized as a decimal string (bigint
  // doesn't survive JSON).
  totalBalance: string

  // Peers
  peerCount: number
  // Subset of peers advertising NODE_COMPACT_FILTERS — required for cfilter
  // requests to succeed.
  filterCapablePeerCount: number

  lastError: string | null
  updatedAt: number
}

export interface SpvUtxoSummary {
  txid: string
  vout: number
  satoshis: string
  address: string
  height: number
}

export interface SpvStatusMessage {
  type: 'status'
  status: SpvStatus
}

export interface SpvUtxosMessage {
  type: 'utxos'
  utxos: SpvUtxoSummary[]
}

export interface SpvErrorMessage {
  type: 'error'
  message: string
}

export type SpvEvent = SpvStatusMessage | SpvUtxosMessage | SpvErrorMessage