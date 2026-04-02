import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import {OperationStatus} from "../../types/OperationStatus";

export class SetAddressLabel {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string, address: string, label: string): Promise<OperationStatus> => {
    return this.walletService.setAddressLabel(walletId, address, label)
  }
}
