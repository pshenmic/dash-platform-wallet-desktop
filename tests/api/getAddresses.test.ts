import { describe, it, expect, beforeAll } from 'vitest'
import { GetWalletAddressesHandler } from '../../src/main/src/api/wallet/GetAddresses'
import { CreateWalletHandler } from '../../src/main/src/api/wallet/CreateWallet'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { KnexProvider } from '../../src/main/src/providers/knexProvider'
import { WalletDAO } from '../../src/main/src/database/WalletDAO'
import { AddressDAO } from '../../src/main/src/database/AddressDAO'
import { WalletService } from '../../src/main/src/services/WalletService'
import { AddressesService } from '../../src/main/src/services/AddressesService'
import path from 'path'
import {IdentityDAO} from "../../src/main/src/database/IdentityDAO";

const VALID_SEEDPHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const PASSWORD = 'password123'

describe('GetWalletAddressesHandler', () => {
  let handler: GetWalletAddressesHandler
  let createWalletHandler: CreateWalletHandler
  let walletDAO: WalletDAO
  let addressDAO: AddressDAO
  let identityDAO: IdentityDAO

  beforeAll(async () => {
    const provider = new KnexProvider()
    walletDAO = new WalletDAO(provider)
    addressDAO = new AddressDAO(provider)
    identityDAO = new IdentityDAO(provider)
    const sdk = new DashPlatformSDK()
    const walletService = new WalletService(walletDAO, addressDAO, identityDAO, sdk, provider)
    const addressesService = new AddressesService(walletDAO, addressDAO)
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
