import { createHomeFolder, getKnex, migrateKnex } from './utils'
import path from 'path'
import os from 'os'
import { HomeFolderName, StorageFilename } from './constants'
import Routes from './routes'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { WalletController } from './controllers/WalletController'
import {ipcMain} from 'electron'
import { WalletAPI } from './api/WalletAPI';
import handlers from './handlers'

export default {
  start: async () => {
    createHomeFolder()
    const knex = getKnex(path.join(os.homedir(), HomeFolderName, StorageFilename))

    await migrateKnex(knex, path.join(process.cwd(), 'src/main/migrations'))

    handlers.init()

    const sdk = new DashPlatformSDK()

    const walletController = new WalletController(knex, sdk)

    Routes(walletController)
  }
}
