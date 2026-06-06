import {describe, it, expect, beforeEach, vi} from 'vitest'
import {SendCoinsHandler} from '../../src/main/src/api/wallet/sendCoins'
import {AddressDAO} from '../../src/main/src/database/AddressDAO'
import {WalletDAO} from '../../src/main/src/database/WalletDAO'
import {WalletProvider} from '../../src/main/src/providers/WalletProvider'
import {CoreTransactionService, SpendableUtxo, UtxoSelection} from '../../src/main/src/services/CoreTransactionService'
import {WalletService} from '../../src/main/src/services/WalletService'
import {Address} from '../../src/main/src/types/Address'
import {Wallet} from '../../src/main/src/types/Wallet'
import {encryptMnemonic} from '../../src/main/src/utils'

const WALLET_ID = 'wallet-1'
const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const PASSWORD = 'password123'

describe('SendCoinsHandler', () => {
  let handler: SendCoinsHandler
  let walletDAO: WalletDAO
  let addressDAO: AddressDAO
  let walletService: WalletService
  let coreTransactionService: CoreTransactionService
  let provider: WalletProvider

  let assertRecipientAddress: ReturnType<typeof vi.fn>
  let collectUtxos: ReturnType<typeof vi.fn>
  let selectUtxosGreedy: ReturnType<typeof vi.fn>
  let buildTransfer: ReturnType<typeof vi.fn>
  let sign: ReturnType<typeof vi.fn>
  let broadcastTx: ReturnType<typeof vi.fn>

  const receivingAddress: Address = {
    walletId: WALLET_ID,
    accountId: 0,
    address: 'receiving-address',
    derivationPath: "m/44'/1'/0'/0/0",
    index: 0,
    isChange: false,
    isUsed: false,
    label: null,
  }

  const changeAddress: Address = {
    walletId: WALLET_ID,
    accountId: 0,
    address: 'change-address',
    derivationPath: "m/44'/1'/0'/1/0",
    index: 0,
    isChange: true,
    isUsed: false,
    label: null,
  }

  const wallet: Wallet = {
    walletId: WALLET_ID,
    encryptedMnemonic: encryptMnemonic(MNEMONIC, PASSWORD, 1_000),
    network: 'testnet',
    label: null,
    selected: false,
  }

  beforeEach(() => {
    assertRecipientAddress = vi.fn()
    collectUtxos = vi.fn()
    selectUtxosGreedy = vi.fn()
    buildTransfer = vi.fn()
    sign = vi.fn()
    broadcastTx = vi.fn()

    provider = {
      broadcastTx,
    } as unknown as WalletProvider

    walletDAO = {
      getWalletById: vi.fn().mockResolvedValue(wallet),
    } as unknown as WalletDAO

    addressDAO = {
      getAddressesByWalletId: vi.fn().mockResolvedValue({
        receiving: [receivingAddress],
        change: [changeAddress],
      }),
    } as unknown as AddressDAO

    walletService = {
      getProvider: vi.fn().mockReturnValue(provider),
    } as unknown as WalletService

    coreTransactionService = {
      assertRecipientAddress,
      collectUtxos,
      selectUtxosGreedy,
      buildTransfer,
      sign,
    } as unknown as CoreTransactionService

    handler = new SendCoinsHandler(walletDAO, addressDAO, walletService, coreTransactionService)
  })

  it('rejects non-positive amounts before loading the wallet', async () => {
    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 0n, PASSWORD),
    ).rejects.toThrow('Amount must be greater than 0')

    expect(walletDAO.getWalletById).not.toHaveBeenCalled()
  })

  it('throws when the wallet does not exist', async () => {
    vi.mocked(walletDAO.getWalletById).mockResolvedValue(null)

    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD),
    ).rejects.toThrow('Wallet not found')
  })

  it('validates recipient address against the wallet network', async () => {
    assertRecipientAddress.mockImplementation(() => {
      throw new Error('Invalid recipient address')
    })

    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD),
    ).rejects.toThrow('Invalid recipient address')

    expect(assertRecipientAddress).toHaveBeenCalledWith('to-address', 'testnet')
    expect(addressDAO.getAddressesByWalletId).not.toHaveBeenCalled()
  })

  it('throws a user-facing error for an invalid password', async () => {
    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, 'wrong-password'),
    ).rejects.toThrow('Invalid password')

    expect(collectUtxos).not.toHaveBeenCalled()
  })

  it('throws when the wallet has no addresses', async () => {
    vi.mocked(addressDAO.getAddressesByWalletId).mockResolvedValue({receiving: [], change: []})

    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD),
    ).rejects.toThrow('Wallet has no addresses')

    expect(walletService.getProvider).not.toHaveBeenCalled()
  })

  it('throws when no UTXOs are available', async () => {
    collectUtxos.mockResolvedValue([])

    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD),
    ).rejects.toThrow('Insufficient funds')
  })

  it('throws when selected UTXOs do not cover the requested amount', async () => {
    const spendableUtxo: SpendableUtxo = {
      utxo: {txId: 'txid', vOut: 0, satoshis: 500n, script: {} as never},
      address: receivingAddress,
    }

    collectUtxos.mockResolvedValue([spendableUtxo])
    selectUtxosGreedy.mockReturnValue({utxos: [spendableUtxo], totalIn: 500n})

    await expect(
      handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD),
    ).rejects.toThrow('Insufficient funds')

    expect(buildTransfer).not.toHaveBeenCalled()
  })

  it('builds, signs, and broadcasts the transaction', async () => {
    const transaction = {id: 'tx'} as never
    const spendableUtxo: SpendableUtxo = {
      utxo: {txId: 'txid', vOut: 0, satoshis: 2_000n, script: {} as never},
      address: receivingAddress,
    }
    const utxoSelection: UtxoSelection = {utxos: [spendableUtxo], totalIn: 2_000n}

    collectUtxos.mockResolvedValue([spendableUtxo])
    selectUtxosGreedy.mockReturnValue(utxoSelection)
    buildTransfer.mockReturnValue(transaction)
    broadcastTx.mockResolvedValue('broadcast-txid')

    const result = await handler.handle(null as never, WALLET_ID, 'to-address', 1_000n, PASSWORD)

    expect(result).toBe('broadcast-txid')
    expect(walletService.getProvider).toHaveBeenCalledWith(WALLET_ID, 'testnet')
    expect(collectUtxos).toHaveBeenCalledWith(provider, [receivingAddress, changeAddress])
    expect(selectUtxosGreedy).toHaveBeenCalledWith([spendableUtxo], 1_000n)
    expect(buildTransfer).toHaveBeenCalledWith([spendableUtxo], 'to-address', 1_000n, [changeAddress], 2_000n)
    expect(sign).toHaveBeenCalledWith(transaction, [spendableUtxo], MNEMONIC, 'testnet')
    expect(broadcastTx).toHaveBeenCalledWith(transaction)
  })
})
