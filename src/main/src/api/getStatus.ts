import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../services/WalletService'
import { ApplicationService } from '../services/ApplicationService'
import {Network} from "../types";

export interface AppStatus {
  ready: boolean
  selectedWalletId: string | null
  network: Network | null
}

export class GetStatusHandler {
  private walletService: WalletService
  private applicationService: ApplicationService

  constructor(walletService: WalletService, applicationService: ApplicationService) {
    this.walletService = walletService
    this.applicationService = applicationService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<AppStatus> => {
    const selected = await this.walletService.getSelectedWallet()

    return {
      ready: this.applicationService.isReady(),
      selectedWalletId: selected?.walletId ?? null,
      network: selected?.network ?? null,
    }
  }
}
