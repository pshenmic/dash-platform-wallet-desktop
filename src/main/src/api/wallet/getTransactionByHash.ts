import { IpcMainInvokeEvent } from 'electron/utility'
import { Network } from '../../types'
import { WalletService } from '../../services/WalletService'
import {TransactionJSON} from "dash-core-sdk/src/types.js";

export class GetTransactionByHashHandler {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, hash: string, network: Network): Promise<TransactionJSON> => {
    return this.walletService.getTransactionByHash(hash, network)
  }
}
