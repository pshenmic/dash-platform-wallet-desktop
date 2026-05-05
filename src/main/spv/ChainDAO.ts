import {ClassicLevel} from 'classic-level'
import {Network} from '../src/types'

export interface PersistedHeader {
  height: number
  hash: string
  prevHash: string
  time: number
  nBits: number
  raw: Uint8Array
}

export interface ChainTipState {
  tipHeight: number
  tipHash: string | null
}

interface StoredState extends ChainTipState {
  updatedAt: number
}

const HEIGHT_KEY_WIDTH = 12

function headerKey(height: number): string {
  return `h:${height.toString().padStart(HEIGHT_KEY_WIDTH, '0')}`
}

function stateKey(network: Network): string {
  return `s:${network}`
}

export class ChainDAO {
  private db: ClassicLevel<string, Uint8Array>
  private opened = false

  constructor(path: string) {
    this.db = new ClassicLevel<string, Uint8Array>(path, {
      keyEncoding: 'utf8',
      valueEncoding: 'view',
      createIfMissing: true,
    })
  }

  open = async (): Promise<void> => {
    if (this.opened) return
    await this.db.open()
    this.opened = true
  }

  close = async (): Promise<void> => {
    if (!this.opened) return
    await this.db.close()
    this.opened = false
  }

  initSyncState = async (network: Network): Promise<ChainTipState> => {

    const defaultValue = async ()=> {
      const initial: StoredState = {tipHeight: 0, tipHash: null, updatedAt: Date.now()}
      await this.db.put(stateKey(network), encodeJson(initial))
      return {tipHeight: 0, tipHash: null}
    }

    try {
      const buf = await this.db.get(stateKey(network))

      console.log('stage 1: ', buf)

      if(buf == null) return defaultValue()

      const stored = JSON.parse(Buffer.from(buf).toString('utf8')) as StoredState

      console.log('stage 2: ', stored)

      if (stored == null) return defaultValue()

      console.log('stage 3: returning sync state')

      return {tipHeight: stored.tipHeight, tipHash: stored.tipHash}
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code !== 'LEVEL_NOT_FOUND') throw err
      return defaultValue()
    }
  }

  // Atomic write: all headers + sync_state update land together. LevelDB's
  // batch API handles arbitrarily large batches without the 999-parameter
  // limit that forced per-50 chunking under SQLite.
  appendHeaders = async (
    network: Network,
    headers: PersistedHeader[],
    nextState: ChainTipState,
  ): Promise<void> => {
    if (headers.length === 0) return
    const batch = this.db.batch()
    for (const h of headers) {
      batch.put(headerKey(h.height), h.raw)
    }
    const stored: StoredState = {
      tipHeight: nextState.tipHeight,
      tipHash: nextState.tipHash,
      updatedAt: Date.now(),
    }
    batch.put(stateKey(network), encodeJson(stored))
    await batch.write()
  }

  getHeaderByHeight = async (height: number): Promise<Uint8Array | null> => {
    try {
      return (await this.db.get(headerKey(height))) ?? null
    } catch (err) {
      if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') return null
      throw err
    }
  }
}

function encodeJson(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value))
}
