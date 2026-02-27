import { createHomeFolder, getKnex, migrateKnex } from './utils'
import path from 'path'
import os from 'os'
import { HomeFolderName, StorageFilename } from './constants'
import Routes from './routes'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { WalletController } from './controllers/WalletController'

export default {
  start: async () => {
    createHomeFolder()
    const knex = getKnex(path.join(os.homedir(), HomeFolderName, StorageFilename))
    await migrateKnex(knex, '../migrations')

    const sdk = new DashPlatformSDK()

    const walletController = new WalletController(knex, sdk)

    Routes(walletController)
  }
}
