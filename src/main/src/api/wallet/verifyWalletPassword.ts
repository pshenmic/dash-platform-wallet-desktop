import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'

export class VerifyWalletPasswordHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, password: string, walletId: string): Promise<boolean> => {
    return this.walletService.verifyWalletPassword(password, walletId)
  }
}
