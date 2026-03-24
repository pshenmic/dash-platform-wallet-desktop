import { IpcMainInvokeEvent } from 'electron/utility'
import { WalletService } from '../../services/WalletService'
import { AddressesService } from '../../services/AddressesService'
import {GroupedAddresses} from "../../types/GroupedAddresses";

export class GetWalletAddressesHandler {
  private walletService: WalletService
  private addressesService: AddressesService

  constructor(walletService: WalletService, addressesService: AddressesService) {
    this.walletService = walletService
    this.addressesService = addressesService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string): Promise<GroupedAddresses> => {
    const wallet = await this.walletService.getWalletById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return this.addressesService.getAddressesByWalletId(walletId)
  }
}
