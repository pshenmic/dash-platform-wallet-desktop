import {IpcMainInvokeEvent} from 'electron/utility'
import {CoreTransactionService} from '../../services/CoreTransactionService'
import {WalletDAO} from '../../database/WalletDAO'
import {AddressDAO} from '../../database/AddressDAO'
import {WalletService} from '../../services/WalletService'
import {decryptMnemonic} from '../../utils'

export class SendCoinsHandler {
  constructor(
    private readonly walletDAO: WalletDAO,
    private readonly addressDAO: AddressDAO,
    private readonly walletService: WalletService,
    private readonly coreTransactionService: CoreTransactionService,
  ) {}

  handle = async (
    _event: IpcMainInvokeEvent,
    walletId: string,
    toAddress: string,
    amountSatoshis: bigint,
    password: string,
  ): Promise<string> => {
    if (amountSatoshis <= 0n) {
      throw new Error('Amount must be greater than 0')
    }

    const wallet = await this.walletDAO.getWalletById(walletId)
    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    const recipientType = this.coreTransactionService.classifyRecipientAddress(toAddress, wallet.network)

    let mnemonic: string
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, password)
    } catch {
      throw new Error('Invalid password')
    }

    const walletAddresses = await this.addressDAO.getAddressesByWalletId(walletId)
    const spendableAddresses = [...walletAddresses.receiving, ...walletAddresses.change]
    if (spendableAddresses.length === 0) {
      throw new Error('Wallet has no addresses')
    }

    const provider = this.walletService.getProvider(wallet.walletId, wallet.network)
    await provider.ensureReady()

    const spendableUtxos = await this.coreTransactionService.collectUtxos(provider, spendableAddresses)
    if (spendableUtxos.length === 0) {
      throw new Error('Insufficient funds')
    }

    const utxoSelection = this.coreTransactionService.selectUtxosGreedy(spendableUtxos, amountSatoshis)
    // Recipient output + change output. The fee must come out of the inputs on
    // top of the amount — otherwise generateChange builds a near-zero-fee tx.
    const estimatedFee = this.coreTransactionService.estimateFee(utxoSelection.utxos.length, 2)
    if (utxoSelection.totalIn < amountSatoshis + estimatedFee) {
      throw new Error('Insufficient funds to cover amount and network fee')
    }

    const transaction = this.coreTransactionService.buildTransfer(
      utxoSelection.utxos,
      toAddress,
      recipientType,
      amountSatoshis,
      walletAddresses.change,
      utxoSelection.totalIn,
    )

    await this.coreTransactionService.sign(transaction, utxoSelection.utxos, mnemonic, wallet.network)

    return provider.broadcastTx(transaction)
  }
}
