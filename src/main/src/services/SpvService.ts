import {utilityProcess, UtilityProcess} from 'electron'
import path from 'path'
import os from 'os'
import {ChainStorageFilename, HomeFolderName} from '../constants'
import {WalletDAO} from '../database/WalletDAO'
import {SpvCommand, SpvEvent, SpvStatus} from '../../spv/messages'

// NOTE: Preferences-based checkpoint plumbing is temporarily detached. The
// checkpoint is hardcoded in startSync below until the SPV path needs the
// configurable trust anchor again — at which point pass `Preferences` back
// in via the constructor and read `preferences.chain[network]`.
export class SpvService {
  private walletDAO: WalletDAO
  private child: UtilityProcess | null = null
  private status: SpvStatus | null = null
  private activeWalletId: string | null = null

  constructor(walletDAO: WalletDAO) {
    this.walletDAO = walletDAO
  }

  private ensureChild(): UtilityProcess {
    if (this.child) return this.child

    const scriptPath = path.join(__dirname, 'spv.js')
    const child = utilityProcess.fork(scriptPath, [], { serviceName: 'spv' })

    child.on('message', (data: SpvEvent) => {
      if (data.type === 'status') {
        this.status = data.status
      } else if (data.type === 'error') {
        console.log(data)
        console.error('[spv] utility process error:', data.message)
      }
    })

    child.on('exit', code => {
      console.log(`[spv] utility process exited code=${code}`)
      this.child = null
      this.status = null
      this.activeWalletId = null
    })

    this.child = child
    return child
  }

  private send(command: SpvCommand): void {
    this.ensureChild().postMessage(command)
  }

  startSync = async (walletId: string): Promise<SpvStatus | null> => {
    const wallet = await this.walletDAO.getWalletById(walletId)
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`)
    }
    const network = wallet.network as 'mainnet' | 'testnet'

    if (this.activeWalletId && this.activeWalletId !== walletId) {
      this.send({ type: 'stop' })
    }

    this.activeWalletId = walletId
    // TODO: Checkpoints
    this.send({
      type: 'start',
      network,
      chainDbPath: path.join(os.homedir(), HomeFolderName, ChainStorageFilename),
      startHeight: 1,
      startHash: '0000047d24635e347be3aaaeb66c26be94901a2f962feccd4f95090191f208c1',
    })

    return this.status
  }

  stopSync = (): void => {
    if (!this.child) return
    this.send({ type: 'stop' })
    this.activeWalletId = null
  }

  getStatus = (): SpvStatus | null => {
    return this.status
  }

  shutdown = (): void => {
    if (this.child) {
      this.child.kill()
      this.child = null
      this.status = null
      this.activeWalletId = null
    }
  }
}
