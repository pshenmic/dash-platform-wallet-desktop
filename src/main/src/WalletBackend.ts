import { ensureHomeFolder, getKnex, migrateKnex } from './utils'
import path from 'path'
import os from 'os'
import { HomeFolderName, StorageFilename } from './constants'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { ipcMain } from 'electron'
import { WalletDAO } from './database/WalletDAO'
import { AddressDAO } from './database/AddressDAO'
import { WalletService } from './services/WalletService'
import { AddressesService } from './services/AddressesService'
import { ApplicationService } from './services/ApplicationService'
import { CreateWalletHandler } from './api/wallet/CreateWallet'
import { GetWalletAddressesHandler } from './api/wallet/GetAddresses'
import { GetStatusHandler } from './api/GetStatus'
import { GetAllWalletsHandler } from './api/wallet/GetAllWallets'

export class WalletBackend {
  private walletService?: WalletService
  private addressesService?: AddressesService
  private applicationService?: ApplicationService

  private initHandlers() {
    if (!this.walletService || !this.addressesService || !this.applicationService) {
      throw new Error('Services not initialized. Call start() first.')
    }

    ipcMain.handle('createWallet', new CreateWalletHandler(this.walletService).handle)
    ipcMain.handle('getWalletAddresses', new GetWalletAddressesHandler(this.walletService, this.addressesService).handle)
    ipcMain.handle('getStatus', new GetStatusHandler(this.walletService, this.applicationService).handle)
    ipcMain.handle('getAllWallets', new GetAllWalletsHandler(this.walletService).handle)
  }

  async start() {
    ensureHomeFolder()

    const knex = getKnex(path.join(os.homedir(), HomeFolderName, StorageFilename))

    await migrateKnex(knex, path.join(process.cwd(), 'src/main/migrations'))

    const walletDAO = new WalletDAO(knex)
    const addressDAO = new AddressDAO(knex)
    const dashPlatformSDK = new DashPlatformSDK({ network: 'testnet' })

    this.applicationService = new ApplicationService()
    this.walletService = new WalletService(walletDAO, addressDAO, dashPlatformSDK)
    this.addressesService = new AddressesService(addressDAO)

    this.initHandlers()

    this.applicationService.markReady()
  }
}
