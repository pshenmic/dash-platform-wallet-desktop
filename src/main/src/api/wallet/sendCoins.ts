import {IpcMainInvokeEvent} from 'electron/utility'
import {WalletService} from '../../services/WalletService'

export class SendCoinsHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (
    _event: IpcMainInvokeEvent,
    walletId: string,
    toAddress: string,
    amountSatoshis: string,
    password: string,
  ): Promise<string> => {
    return this.walletService.sendCoins(walletId, toAddress, amountSatoshis, password)
  }
}
