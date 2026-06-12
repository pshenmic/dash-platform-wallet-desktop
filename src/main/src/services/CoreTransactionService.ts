import {DashPlatformSDK} from 'dash-platform-sdk'
import {
  Input,
  Output,
  PrivateKey,
  Script,
  Transaction as SDKTransaction,
  utils as sdkUtils,
} from 'dash-core-sdk'
import {Network} from '../types'
import {SEQUENCE_FINAL} from '../constants'

export interface TransferInput {
  txId: string
  vOut: number
  script: Script
  derivationPath: string
  address: string
}

export interface BuildSignedTransferParams {
  inputs: TransferInput[]
  toAddress: string
  amount: bigint
  changeAddress: string
  inputTotal: bigint
  mnemonic: string
  network: Network
}

export class CoreTransactionService {
  constructor(
    private readonly sdk: DashPlatformSDK,
  ) {}

  // Rejects an address that is malformed or belongs to a different network —
  // the SDK round-trips it through its public-key-hash and only the same
  // address re-encodes for the wallet's network.
  assertRecipientAddress(address: string, network: Network): void {
    let publicKeyHash: Uint8Array
    try {
      publicKeyHash = sdkUtils.addressToPublicKeyHash(address)
    } catch {
      throw new Error('Invalid recipient address')
    }
    const addressForNetwork = sdkUtils.publicKeyHashToAddress(publicKeyHash, network)
    if (addressForNetwork !== address) {
      throw new Error(`Recipient address is not a valid ${network} address`)
    }
  }

  // Builds a single-recipient P2PKH transfer from the selected inputs, lets the
  // SDK append a change output (generateChange computes the fee internally and
  // only adds change when worthwhile), then signs each input with the key
  // derived from its address' derivation path.
  async buildSignedTransfer(params: BuildSignedTransferParams): Promise<SDKTransaction> {
    const {inputs, toAddress, amount, changeAddress, inputTotal, mnemonic, network} = params

    const seed = this.sdk.keyPair.mnemonicToSeed(mnemonic)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, network)

    const transaction = new SDKTransaction()
    const privateKeys: PrivateKey[] = []

    for (const input of inputs) {
      transaction.addInput(new Input(input.txId, input.vOut, input.script, SEQUENCE_FINAL))

      const derived = await this.sdk.keyPair.derivePath(hdKey, input.derivationPath)
      if (!derived.privateKey) {
        throw new Error(`Failed to derive private key for ${input.address}`)
      }
      privateKeys.push(PrivateKey.fromBytes(derived.privateKey as Uint8Array, network, true))
    }

    transaction.addOutput(Output.createP2PKH(amount, toAddress))
    transaction.generateChange(changeAddress, inputTotal)
    transaction.sign(privateKeys)

    return transaction
  }
}
