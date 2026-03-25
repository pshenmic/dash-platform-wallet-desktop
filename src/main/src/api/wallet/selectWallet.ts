import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import {QueryStatus} from "../../types/QueryStatus";

export class SelectWallet {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string): Promise<QueryStatus> => {
    return this.walletService.setSelectedWallet(walletId)
  }
}
