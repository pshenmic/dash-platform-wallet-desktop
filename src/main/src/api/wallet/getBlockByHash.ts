import { IpcMainInvokeEvent } from 'electron/utility'
import { Network } from '../../types'
import { WalletService } from '../../services/WalletService'
import {BlockJSON} from "dash-core-sdk/src/types";

export class GetBlockByHash {
  private walletService: WalletService

  constructor(walletService: WalletService) {
    this.walletService = walletService
  }

  handle = async (_event: IpcMainInvokeEvent, hash: string, network: Network): Promise<BlockJSON> => {
    return this.walletService.getBlockByHash(hash, network)
  }
}
