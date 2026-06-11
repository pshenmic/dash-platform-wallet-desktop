import {DashPlatformSDK} from 'dash-platform-sdk'
import {
  Input,
  Output,
  PrivateKey,
  Script,
  Transaction as SDKTransaction,
  utils as sdkUtils,
} from 'dash-core-sdk'
// Deep-imported with the explicit .js extension: dash-core-sdk is externalized
// in the electron-vite main build, so these are real Node ESM imports at
// runtime — Node requires the extension (the SDK root re-exports neither).
import {Base58Check} from 'dash-core-sdk/src/base58check.js'
import {CHANGE_OUTPUT_MAX_SIZE, FEE_PER_BYTE, SIGNED_INPUT_MAX_SIZE} from 'dash-core-sdk/src/constants.js'
import {WalletProvider} from '../providers/WalletProvider'
import {Network} from '../types'
import {Address} from '../types/Address'
import {UTXO} from '../types/UTXO'
import {ADDRESS_PREFIX, SEQUENCE_FINAL, TX_BASE_OVERHEAD_SIZE} from '../constants'

// Recipient output script type, derived from the address version byte.
export type RecipientType = 'p2pkh' | 'p2sh'

// A decoded Dash base58 address is a 1-byte version prefix + 20-byte hash.
const ADDRESS_DECODED_LENGTH = 21

export interface SpendableUtxo {
  utxo: UTXO
  address: Address
}

export interface UtxoSelection {
  utxos: SpendableUtxo[]
  totalIn: bigint
}

export class CoreTransactionService {
  constructor(
    private readonly sdk: DashPlatformSDK,
  ) {}

  // Validates the recipient address and returns its output script type. The
  // version byte both tells us P2PKH vs P2SH and pins the address to the
  // wallet's network — a mainnet address on a testnet wallet (or vice versa)
  // is rejected here rather than silently built into an unspendable output.
  classifyRecipientAddress(address: string, network: Network): RecipientType {
    let decoded: Uint8Array
    try {
      decoded = Base58Check.decode(address)
    } catch {
      throw new Error('Invalid recipient address')
    }
    if (decoded.length !== ADDRESS_DECODED_LENGTH) {
      throw new Error('Invalid recipient address')
    }
    const prefixes = ADDRESS_PREFIX[network]
    const version = decoded[0]
    if (version === prefixes.p2pkh) return 'p2pkh'
    if (version === prefixes.p2sh) return 'p2sh'
    throw new Error(`Recipient address is not a valid ${network} address`)
  }

  // Conservative miner-fee estimate mirroring the SDK's own size constants
  // (TX_BASE_OVERHEAD_SIZE + SIGNED_INPUT_MAX_SIZE per input + CHANGE_OUTPUT_MAX_SIZE
  // per output, at FEE_PER_BYTE). Used to reject sends whose inputs can't also
  // cover the fee BEFORE handing the tx to SDK generateChange — which would
  // otherwise quietly build a near-zero-fee tx that never relays.
  estimateFee(inputCount: number, outputCount: number): bigint {
    const size = TX_BASE_OVERHEAD_SIZE
      + inputCount * SIGNED_INPUT_MAX_SIZE
      + outputCount * CHANGE_OUTPUT_MAX_SIZE
    return BigInt(size * FEE_PER_BYTE)
  }

  async collectUtxos(
    provider: WalletProvider,
    addresses: Address[],
  ): Promise<SpendableUtxo[]> {
    const utxosByAddress = await Promise.all(
      addresses.map(async walletAddress => ({
        walletAddress,
        utxos: await provider.getUTXOs(walletAddress.address),
      }))
    )
    return utxosByAddress.flatMap(({walletAddress, utxos}) =>
      utxos.map(utxo => ({utxo, address: walletAddress}))
    )
  }

  // Greedy largest-first. Stops once the accumulated input amount covers
  // `target + the estimated fee` for the inputs picked so far (recipient +
  // change output). The handler re-checks the same estimate before building;
  // final fee math is deferred to SDKTransaction.generateChange.
  selectUtxosGreedy(
    candidates: SpendableUtxo[],
    target: bigint,
  ): UtxoSelection {
    const candidatesByDescendingAmount = [...candidates].sort((a, b) =>
      a.utxo.satoshis > b.utxo.satoshis ? -1 : a.utxo.satoshis < b.utxo.satoshis ? 1 : 0
    )
    const selectedInputs: SpendableUtxo[] = []
    let totalIn = 0n
    for (const candidate of candidatesByDescendingAmount) {
      selectedInputs.push(candidate)
      totalIn += candidate.utxo.satoshis
      if (totalIn >= target + this.estimateFee(selectedInputs.length, 2)) break
    }
    return {utxos: selectedInputs, totalIn}
  }

  // Builds a transfer: a single recipient output (P2PKH or P2SH per
  // recipientType) funded by the selected UTXOs, with change routed to the
  // first unused (or, if none, the first available) wallet change address.
  // Change is always P2PKH — our change addresses are P2PKH.
  buildTransfer(
    inputUtxos: SpendableUtxo[],
    toAddress: string,
    recipientType: RecipientType,
    amount: bigint,
    changeAddresses: Address[],
    totalIn: bigint,
  ): SDKTransaction {
    const changeAddress = this.pickChangeAddress(changeAddresses)

    const inputs = inputUtxos.map(({utxo}) => new Input(utxo.txId, utxo.vOut, utxo.script, SEQUENCE_FINAL))

    const recipientOutput = new Output(amount)
    if (recipientType === 'p2sh') {
      // generateP2PKH would build a P2PKH script from the script-hash bytes
      // and burn the funds; P2SH needs its own OP_HASH160 <hash> OP_EQUAL script.
      recipientOutput.script = this.p2shScript(toAddress)
    } else {
      recipientOutput.generateP2PKH(toAddress)
    }

    const transaction = new SDKTransaction(inputs, [recipientOutput])
    // generateChange computes fee internally (FEE_PER_BYTE) and only appends
    // a change output when worthwhile. Throws if totalIn < amount.
    transaction.generateChange(changeAddress, totalIn)
    return transaction
  }

  private p2shScript(address: string): Script {
    const script = new Script()
    script.pushOpCode('OP_HASH160')
    script.pushOpCode('OP_PUSHBYTES_20', sdkUtils.addressToPublicKeyHash(address))
    script.pushOpCode('OP_EQUAL')
    return script
  }

  private pickChangeAddress(changeAddresses: Address[]): string {
    if (changeAddresses.length === 0) {
      throw new Error('Wallet has no change addresses')
    }
    const unusedChangeAddress = changeAddresses.find(address => !address.isUsed)
    return (unusedChangeAddress ?? changeAddresses[0]).address
  }

  async sign(
    transaction: SDKTransaction,
    inputsToSign: SpendableUtxo[],
    mnemonic: string,
    network: Network,
  ): Promise<void> {
    const seed = this.sdk.keyPair.mnemonicToSeed(mnemonic)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, network)

    const privateKeys = await Promise.all(
      inputsToSign.map(async spendableInput => {
        const derived = await this.sdk.keyPair.derivePath(hdKey, spendableInput.address.derivationPath)
        if (!derived.privateKey) {
          throw new Error(`Failed to derive private key for ${spendableInput.address.address}`)
        }
        return PrivateKey.fromBytes(derived.privateKey, network, true)
      })
    )

    transaction.sign(privateKeys)
  }

}
