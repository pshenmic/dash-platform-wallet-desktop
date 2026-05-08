import { IpcMainInvokeEvent } from 'electron/utility'
import { Network } from '../../types'
import { WalletService } from '../../services/WalletService'
import { AddressDAO } from '../../database/AddressDAO'
import { SpvService } from '../../services/SpvService'

export class CreateWalletHandler {
  private walletService: WalletService
  private addressDAO: AddressDAO
  private spvService: SpvService

  constructor(walletService: WalletService, addressDAO: AddressDAO, spvService: SpvService) {
    this.walletService = walletService
    this.addressDAO = addressDAO
    this.spvService = spvService
  }

  handle = async (_event: IpcMainInvokeEvent, seedphrase: string, network: Network, password: string): Promise<string> => {
    const walletId = await this.walletService.createWallet(seedphrase, network, password)
    // Push the new wallet's addresses into a running SPV scan only if it's
    // already syncing THIS wallet (per-wallet sync model). The utility
    // process gates on walletId match and silently drops mismatches, so
    // calling unconditionally is safe.
    const grouped = await this.addressDAO.getAddressesByWalletId(walletId)
    const addressList = [...grouped.receiving, ...grouped.change].map(a => a.address)
    this.spvService.addWatchAddresses(walletId, addressList)
    return walletId
  }
}