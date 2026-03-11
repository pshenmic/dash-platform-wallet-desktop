import { IpcMainInvokeEvent } from 'electron/utility'
import { Network } from '../../types'
import { WalletService } from '../../services/WalletService'

export class CreateWalletHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, seedphrase: string, network: Network, password: string): Promise<string> => {
    return this.walletService.createWallet(seedphrase, network, password)
  }
}