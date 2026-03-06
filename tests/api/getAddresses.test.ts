import { describe, it, expect, beforeAll } from 'vitest'
import { GetWalletAddressesHandler } from '../../src/main/src/api/wallet/GetAddresses'
import { CreateWalletHandler } from '../../src/main/src/api/wallet/CreateWallet'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { getKnex, migrateKnex } from '../../src/main/src/utils'
import { WalletDAO } from '../../src/main/src/database/WalletDAO'
import { AddressDAO } from '../../src/main/src/database/AddressDAO'
import { WalletService } from '../../src/main/src/services/WalletService'
import { AddressesService } from '../../src/main/src/services/AddressesService'
import path from 'path'

const VALID_SEEDPHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const PASSWORD = 'password123'

describe('GetWalletAddressesHandler', () => {
  let handler: GetWalletAddressesHandler
  let createWalletHandler: CreateWalletHandler
  let walletDAO: WalletDAO
  let addressDAO: AddressDAO

  beforeAll(async () => {
    const knex = getKnex()
    await migrateKnex(knex, path.join(process.cwd(), 'src/main/migrations'))
    walletDAO = new WalletDAO(knex)
    addressDAO = new AddressDAO(knex)
    const sdk = new DashPlatformSDK()
    const walletService = new WalletService(walletDAO, addressDAO, sdk)
    const addressesService = new AddressesService(addressDAO)
    createWalletHandler = new CreateWalletHandler(walletService)
    handler = new GetWalletAddressesHandler(walletService, addressesService)
  })

  it('should return 40 addresses for a created wallet', async () => {
    const walletId = await createWalletHandler.handle(null as any, VALID_SEEDPHRASE, 'testnet', PASSWORD)
    const addresses = await handler.handle(null as any, walletId)
    expect(addresses).toHaveLength(40)
  })

  it('should return addresses belonging to the requested wallet', async () => {
    const walletId = await createWalletHandler.handle(null as any, VALID_SEEDPHRASE, 'testnet', PASSWORD)
    const addresses = await handler.handle(null as any, walletId)
    addresses.forEach((a) => expect(a.walletId).toBe(walletId))
  })

  it('should throw for unknown walletId', async () => {
    await expect(
      handler.handle(null as any, 'nonexistent')
    ).rejects.toThrow('Wallet not found')
  })
})