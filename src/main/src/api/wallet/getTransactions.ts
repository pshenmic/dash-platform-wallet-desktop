import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import {TransactionWalletProviderJSON} from "../../providers/types";

export class GetTransactionsHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string): Promise<TransactionWalletProviderJSON[]> => {
    return this.walletService.getTransactions(walletId)
  }
}
