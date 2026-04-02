import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import {OperationStatus} from "../../types/OperationStatus";

export class ChangeStoragePasswordHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, password: string): Promise<OperationStatus> => {
    return this.walletService.changeStoragePassword(password)
  }
}
