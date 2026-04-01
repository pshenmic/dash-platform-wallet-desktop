import { ensureHomeFolder } from './utils'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { ipcMain } from 'electron'
import { KnexProvider } from './providers/knexProvider'
import { WalletDAO } from './database/WalletDAO'
import { AddressDAO } from './database/AddressDAO'
import { IdentityDAO } from './database/IdentityDAO'
import { WalletService } from './services/WalletService'
import { AddressesService } from './services/AddressesService'
import { ApplicationService } from './services/ApplicationService'
import { CreateWalletHandler } from './api/wallet/createWallet'
import { GetWalletAddressesHandler } from './api/wallet/getAddresses'
import { GetStatusHandler } from './api/getStatus'
import { GetAllWalletsHandler } from './api/wallet/getAllWallets'
import { GetTransactionsHandler } from './api/wallet/getTransactions'
import { GetIdentitiesHandler } from './api/wallet/getIdentities'
import {GetIdentityBalance} from "./api/wallet/getIdentityBalance";
import {GetIdentityNonce} from "./api/wallet/getIdentityNonce";
import {GetTransactionByHashHandler} from "./api/wallet/getTransactionByHash";
import {GetBlockByHash} from "./api/wallet/getBlockByHash";
import {GetBalance} from "./api/wallet/getBalance";
import {DeleteWalletHandler} from "./api/wallet/deleteWallet";
import {GetWalletBalance} from "./api/wallet/getWalletBalance";
import {SetAddressLabel} from "./api/wallet/setAddressLabel";
import {SelectWallet} from "./api/wallet/selectWallet";
import {AuthStorageHandler} from "./api/wallet/authStorage";
import {ChangeStoragePasswordHandler} from "./api/wallet/changeStoragePassword";
import {LogoutStorage} from "./api/wallet/logoutStorage";

export class WalletBackend {
  private walletService?: WalletService
  private addressesService?: AddressesService
  private applicationService?: ApplicationService

  private initHandlers(): void {
    if (!this.walletService || !this.addressesService || !this.applicationService) {
      throw new Error('Services not initialized. Call start() first.')
    }

    ipcMain.handle('authStorage', new AuthStorageHandler(this.walletService).handle)
    ipcMain.handle('changeStoragePassword', new ChangeStoragePasswordHandler(this.walletService).handle)
    ipcMain.handle('logoutStorage', new LogoutStorage(this.walletService).handle)
    ipcMain.handle('createWallet', new CreateWalletHandler(this.walletService).handle)
    ipcMain.handle('deleteWallet', new DeleteWalletHandler(this.walletService).handle)
    ipcMain.handle('getAddresses', new GetWalletAddressesHandler(this.walletService, this.addressesService).handle)
    ipcMain.handle('getStatus', new GetStatusHandler(this.walletService, this.applicationService).handle)
    ipcMain.handle('selectWallet', new SelectWallet(this.walletService).handle)
    ipcMain.handle('getAllWallets', new GetAllWalletsHandler(this.walletService).handle)
    ipcMain.handle('getTransactions', new GetTransactionsHandler(this.walletService).handle)
    ipcMain.handle('getBalance', new GetBalance(this.walletService).handle)
    ipcMain.handle('getWalletBalance', new GetWalletBalance(this.walletService).handle)
    ipcMain.handle("getTransactionByHash", new GetTransactionByHashHandler(this.walletService).handle)
    ipcMain.handle('getIdentities', new GetIdentitiesHandler(this.walletService).handle)
    ipcMain.handle('getIdentityBalance', new GetIdentityBalance(this.walletService).handle)
    ipcMain.handle('getIdentityNonce', new GetIdentityNonce(this.walletService).handle)
    ipcMain.handle('getBlockByHash', new GetBlockByHash(this.walletService).handle)
    ipcMain.handle('setAddressLabel', new SetAddressLabel(this.walletService).handle)
  }

  async start(): Promise<void> {
    ensureHomeFolder()

    const knexProvider = new KnexProvider()
    const walletDAO = new WalletDAO(knexProvider)
    const addressDAO = new AddressDAO(knexProvider)
    const identityDAO = new IdentityDAO(knexProvider)
    const dashPlatformSDK = new DashPlatformSDK({ network: 'testnet'})

    this.applicationService = new ApplicationService()
    this.walletService = new WalletService(this.applicationService, walletDAO, addressDAO, identityDAO, dashPlatformSDK, knexProvider)
    this.addressesService = new AddressesService(walletDAO, addressDAO)

    this.initHandlers()
  }
}
