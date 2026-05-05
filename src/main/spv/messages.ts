import {Network} from '../src/types'

export interface SpvStartMessage {
  type: 'start'
  network: Network
  chainDbPath: string
  startHeight: number
  startHash: string | null
}

export interface SpvStopMessage {
  type: 'stop'
}

export type SpvCommand = SpvStartMessage | SpvStopMessage

export type SpvPhase = 'idle' | 'connecting' | 'syncing-headers' | 'synced' | 'stopped'

export interface SpvStatus {
  phase: SpvPhase
  network: Network | null
  tipHeight: number
  tipHash: string | null
  peerCount: number
  updatedAt: number
}

export interface SpvStatusMessage {
  type: 'status'
  status: SpvStatus
}

export interface SpvErrorMessage {
  type: 'error'
  message: string
}

export type SpvEvent = SpvStatusMessage | SpvErrorMessage