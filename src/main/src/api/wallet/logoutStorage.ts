import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import {OperationStatus} from "../../types/OperationStatus";

export class LogoutStorage {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<OperationStatus> => {
    return this.walletService.logoutStorage()
  }
}
