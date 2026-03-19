import { IpcMainInvokeEvent } from 'electron/utility'
import { TransactionJSON } from 'dash-core-sdk/src/types.js'
import { WalletService } from '../../services/WalletService'

export class GetTransactionsHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string): Promise<TransactionJSON[]> => {
    return this.walletService.getTransactions(walletId)
  }
}