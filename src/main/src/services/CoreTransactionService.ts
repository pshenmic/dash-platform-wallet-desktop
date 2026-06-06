import {DashPlatformSDK} from 'dash-platform-sdk'
import {
  Input,
  Output,
  PrivateKey,
  Transaction as SDKTransaction,
  utils as sdkUtils,
} from 'dash-core-sdk'
import {WalletProvider} from '../providers/WalletProvider'
import {Network} from '../types'
import {Address} from '../types/Address'
import {UTXO} from '../types/UTXO'
import {SEQUENCE_FINAL} from '../constants'

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
  // `target + a generous fee headroom`. Fee math is deferred to
  // SDKTransaction.generateChange, which throws on real shortfall.
  selectUtxosGreedy(
    candidates: SpendableUtxo[],
    target: bigint,
  ): UtxoSelection {
    const candidatesByDescendingAmount = [...candidates].sort((a, b) =>
      a.utxo.satoshis > b.utxo.satoshis ? -1 : a.utxo.satoshis < b.utxo.satoshis ? 1 : 0
    )
    const selectedInputs: SpendableUtxo[] = []
    let totalIn = 0n
    // Headroom: covers signed inputs + change output + recipient output + tx overhead at FEE_PER_BYTE=1.
    const feeHeadroom = (n: number): bigint => BigInt(n * 150 + 100)
    for (const candidate of candidatesByDescendingAmount) {
      selectedInputs.push(candidate)
      totalIn += candidate.utxo.satoshis
      if (totalIn >= target + feeHeadroom(selectedInputs.length)) break
    }
    return {utxos: selectedInputs, totalIn}
  }

  // Builds a P2PKH transfer: a single recipient output funded by the
  // selected UTXOs, with change routed to the first unused (or, if none,
  // the first available) wallet change address.
  buildTransfer(
    inputUtxos: SpendableUtxo[],
    toAddress: string,
    amount: bigint,
    changeAddresses: Address[],
    totalIn: bigint,
  ): SDKTransaction {
    const changeAddress = this.pickChangeAddress(changeAddresses)

    const inputs = inputUtxos.map(({utxo}) => new Input(utxo.txId, utxo.vOut, utxo.script, SEQUENCE_FINAL))

    const recipientOutput = new Output(amount)
    recipientOutput.generateP2PKH(toAddress)

    const transaction = new SDKTransaction(inputs, [recipientOutput])
    // generateChange computes fee internally (FEE_PER_BYTE) and only appends
    // a change output when worthwhile. Throws if totalIn < amount.
    transaction.generateChange(changeAddress, totalIn)
    return transaction
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
