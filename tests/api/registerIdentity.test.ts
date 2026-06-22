import {describe, it, expect, beforeEach, vi} from 'vitest'
import {RegisterIdentityHandler} from '../../src/main/src/api/wallet/registerIdentity'
import {WalletDAO} from '../../src/main/src/database/WalletDAO'
import {AddressDAO} from '../../src/main/src/database/AddressDAO'
import {IdentityDAO} from '../../src/main/src/database/IdentityDAO'
import {WalletService} from '../../src/main/src/services/WalletService'
import {SdkProvider} from '../../src/main/src/services/SdkProvider'
import {IdentityRegistrationService} from '../../src/main/src/services/IdentityRegistrationService'
import {WalletProvider} from '../../src/main/src/providers/WalletProvider'
import {Address} from '../../src/main/src/types/Address'
import {Wallet} from '../../src/main/src/types/Wallet'
import {encryptMnemonic} from '../../src/main/src/utils'

const WALLET_ID = 'wallet-1'
const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const PASSWORD = 'password123'
const LOCK_AMOUNT = '200000'

function address(addr: string, isChange: boolean): Address {
  return {
    walletId: WALLET_ID,
    accountId: 0,
    address: addr,
    derivationPath: isChange ? "m/44'/1'/0'/1/0" : "m/44'/1'/0'/0/0",
    index: 0,
    isChange,
    isUsed: false,
    label: null,
  }
}

describe('RegisterIdentityHandler', () => {
  let handler: RegisterIdentityHandler
  let walletDAO: WalletDAO
  let addressDAO: AddressDAO
  let identityDAO: IdentityDAO
  let walletService: WalletService
  let sdkProvider: SdkProvider
  let identityRegistrationService: IdentityRegistrationService

  let provider: WalletProvider
  let ensureReady: ReturnType<typeof vi.fn>
  let getUTXOs: ReturnType<typeof vi.fn>
  let broadcastTx: ReturnType<typeof vi.fn>
  let stBroadcast: ReturnType<typeof vi.fn>
  let waitForStResult: ReturnType<typeof vi.fn>
  let insertIdentity: ReturnType<typeof vi.fn>
  let removeIdentity: ReturnType<typeof vi.fn>
  let waitForAssetLockProof: ReturnType<typeof vi.fn>
  let buildSignedAssetLock: ReturnType<typeof vi.fn>

  const assetLockTx = {hash: () => 'assetlock-txid'}
  const stateTransition = {
    getOwnerId: () => ({base58: () => 'identifierABC'}),
    hash: () => 'sthash',
  }

  const wallet: Wallet = {
    walletId: WALLET_ID,
    network: 'testnet',
    label: null,
    encryptedMnemonic: encryptMnemonic(MNEMONIC, PASSWORD, 1_000),
    selected: true,
  }

  beforeEach(() => {
    ensureReady = vi.fn().mockResolvedValue(undefined)
    getUTXOs = vi.fn().mockImplementation((addr: string) =>
      addr === 'recv-addr'
        ? Promise.resolve([{txId: 'tx1', vOut: 0, satoshis: 300_000n, script: {} as never}])
        : Promise.resolve([]),
    )
    broadcastTx = vi.fn().mockResolvedValue('assetlock-txid')
    provider = {ensureReady, getUTXOs, broadcastTx} as unknown as WalletProvider

    walletDAO = {getWalletById: vi.fn().mockResolvedValue(wallet)} as unknown as WalletDAO

    addressDAO = {
      getAddressesByWalletId: vi.fn().mockResolvedValue({
        receiving: [address('recv-addr', false)],
        change: [address('change-addr', true)],
      }),
    } as unknown as AddressDAO

    insertIdentity = vi.fn().mockResolvedValue(undefined)
    removeIdentity = vi.fn().mockResolvedValue(undefined)
    identityDAO = {
      getIdentitiesByWalletId: vi.fn().mockResolvedValue([]),
      getByIdentifier: vi.fn().mockResolvedValue(null),
      insertIdentity,
      removeIdentity,
    } as unknown as IdentityDAO

    walletService = {getProvider: vi.fn().mockReturnValue(provider)} as unknown as WalletService

    stBroadcast = vi.fn().mockResolvedValue(undefined)
    waitForStResult = vi.fn().mockResolvedValue(undefined)
    sdkProvider = {
      getPlatformSDK: vi.fn().mockReturnValue({
        keyPair: {p2pkhAddress: vi.fn().mockReturnValue('credit-addr')},
        stateTransitions: {broadcast: stBroadcast, waitForStateTransitionResult: waitForStResult},
      }),
    } as unknown as SdkProvider

    waitForAssetLockProof = vi.fn().mockResolvedValue({type: 'instantLock'})
    buildSignedAssetLock = vi.fn().mockResolvedValue(assetLockTx)
    identityRegistrationService = {
      findNextIdentityIndex: vi.fn().mockResolvedValue(0),
      deriveRegistrationKey: vi.fn().mockResolvedValue({getPublicKey: () => ({bytes: () => new Uint8Array([1, 2, 3])})}),
      buildSignedAssetLock,
      waitForAssetLockProof,
      deriveIdentityKeys: vi.fn().mockResolvedValue([]),
      buildIdentityCreateTransition: vi.fn().mockReturnValue(stateTransition),
    } as unknown as IdentityRegistrationService

    handler = new RegisterIdentityHandler(walletDAO, addressDAO, identityDAO, walletService, sdkProvider, identityRegistrationService)
  })

  it('funds the asset lock, waits for proof, broadcasts the ST and persists the identity', async () => {
    const result = await handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, PASSWORD)

    expect(result).toEqual({identifier: 'identifierABC', stateTransitionHash: 'sthash'})
    expect(ensureReady).toHaveBeenCalledOnce()
    expect(broadcastTx).toHaveBeenCalledWith(assetLockTx)
    expect(waitForAssetLockProof).toHaveBeenCalledWith(assetLockTx, 'assetlock-txid', ['recv-addr'], 'testnet')
    expect(insertIdentity).toHaveBeenCalledOnce()
    expect(stBroadcast).toHaveBeenCalledWith(stateTransition)
    expect(waitForStResult).toHaveBeenCalledOnce()
  })

  it('rejects a non-positive lock amount before loading the wallet', async () => {
    await expect(
      handler.handle(null as never, WALLET_ID, '0', PASSWORD),
    ).rejects.toThrow('Lock amount must be greater than zero')

    expect(walletDAO.getWalletById).not.toHaveBeenCalled()
  })

  it('throws when the wallet does not exist', async () => {
    vi.mocked(walletDAO.getWalletById).mockResolvedValue(null)

    await expect(
      handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, PASSWORD),
    ).rejects.toThrow('Wallet not found')
  })

  it('throws a user-facing error for an invalid password', async () => {
    await expect(
      handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, 'wrong-password'),
    ).rejects.toThrow('Invalid wallet password')

    expect(buildSignedAssetLock).not.toHaveBeenCalled()
  })

  it('throws when the wallet has no spendable funds', async () => {
    getUTXOs.mockResolvedValue([])

    await expect(
      handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, PASSWORD),
    ).rejects.toThrow('No spendable funds in this wallet')
  })

  it('rolls back the persisted identity when the ST broadcast fails', async () => {
    stBroadcast.mockRejectedValue(new Error('network down'))

    await expect(
      handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, PASSWORD),
    ).rejects.toThrow('network down')

    expect(removeIdentity).toHaveBeenCalledWith(WALLET_ID, 'identifierABC')
  })

  it('treats an already-in-chain ST as success and skips waiting', async () => {
    stBroadcast.mockRejectedValue(new Error('state transition already in chain'))

    const result = await handler.handle(null as never, WALLET_ID, LOCK_AMOUNT, PASSWORD)

    expect(result.identifier).toBe('identifierABC')
    expect(removeIdentity).not.toHaveBeenCalled()
    expect(waitForStResult).not.toHaveBeenCalled()
  })
})
