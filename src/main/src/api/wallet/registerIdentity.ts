import {IpcMainInvokeEvent} from 'electron/utility'
import {WalletDAO} from '../../database/WalletDAO'
import {AddressDAO} from '../../database/AddressDAO'
import {IdentityDAO} from '../../database/IdentityDAO'
import {WalletService} from '../../services/WalletService'
import {SdkProvider} from '../../services/SdkProvider'
import {IdentityRegistrationService} from '../../services/IdentityRegistrationService'
import {TransferInput} from '../../services/CoreTransactionService'
import {selectCoins, SelectableUtxo} from '../../services/coinSelection'
import {GroupedAddresses} from '../../types/GroupedAddresses'
import {RegisterIdentityResult} from '../../types/RegisterIdentityResult'
import {decryptMnemonic} from '../../utils'

const ALREADY_IN_CHAIN_MESSAGE = 'state transition already in chain'

// Orchestrates identity registration: fund an L1 asset lock from wallet UTXOs,
// wait for its instant/chain lock proof, then broadcast a Platform
// IdentityCreateTransition. Unlike the browser extension there is no one-time
// funding key — the asset lock is funded directly from the wallet's own UTXOs.
export class RegisterIdentityHandler {
  constructor(
    private readonly walletDAO: WalletDAO,
    private readonly addressDAO: AddressDAO,
    private readonly identityDAO: IdentityDAO,
    private readonly walletService: WalletService,
    private readonly sdkProvider: SdkProvider,
    private readonly identityRegistrationService: IdentityRegistrationService,
  ) {}

  handle = async (
    _event: IpcMainInvokeEvent,
    walletId: string,
    lockAmount: string,
    password: string,
  ): Promise<RegisterIdentityResult> => {
    const lockAmountDuffs = BigInt(lockAmount)
    if (lockAmountDuffs <= 0n) {
      throw new Error('Lock amount must be greater than zero')
    }

    const wallet = await this.walletDAO.getWalletById(walletId)
    if (wallet == null) {
      throw new Error('Wallet not found')
    }
    const network = wallet.network

    let mnemonic: string
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, password)
    } catch {
      throw new Error('Invalid wallet password')
    }

    // Identity index + the keys derived from it. findNextIdentityIndex scans
    // past indices whose auth key is already registered on Platform.
    const localIdentities = await this.identityDAO.getIdentitiesByWalletId(walletId)
    const startIndex = localIdentities.reduce((max, identity) => Math.max(max, identity.identityIndex + 1), 0)
    const identityIndex = await this.identityRegistrationService.findNextIdentityIndex(mnemonic, startIndex, network)

    const registrationKey = await this.identityRegistrationService.deriveRegistrationKey(mnemonic, identityIndex, network)
    const creditAddress = this.sdkProvider.getPlatformSDK(network).keyPair.p2pkhAddress(registrationKey.getPublicKey().bytes(), network)

    // Fund the asset lock from wallet UTXOs (same collection + selection path
    // as a normal send).
    const grouped = await this.addressDAO.getAddressesByWalletId(walletId)
    const allAddresses = [...grouped.receiving, ...grouped.change]
    const pathByAddress = new Map(allAddresses.map(a => [a.address, a.derivationPath]))

    const provider = this.walletService.getProvider(walletId, network)
    await provider.ensureReady()

    const utxoLists = await Promise.all(
      allAddresses.map(async (a) => {
        const utxos = await provider.getUTXOs(a.address)
        return utxos.map(u => ({utxo: u, address: a.address}))
      }),
    )
    const ownedUtxos = utxoLists.flat()
    if (ownedUtxos.length === 0) {
      throw new Error('No spendable funds in this wallet')
    }

    const selectable: SelectableUtxo[] = ownedUtxos.map(({utxo, address}) => ({
      txid: utxo.txId,
      vout: utxo.vOut,
      satoshis: utxo.satoshis,
      address,
    }))
    const selection = selectCoins(selectable, lockAmountDuffs)

    const utxoByKey = new Map(ownedUtxos.map(o => [`${o.utxo.txId}:${o.utxo.vOut}`, o]))
    const changeAddress = this.pickChangeAddress(grouped)

    const inputs: TransferInput[] = selection.inputs.map(input => {
      const owned = utxoByKey.get(`${input.txid}:${input.vout}`)
      if (!owned) throw new Error('Selected UTXO no longer available')

      const derivationPath = pathByAddress.get(input.address)
      if (derivationPath == null) throw new Error(`No derivation path for address ${input.address}`)

      return {
        txId: owned.utxo.txId,
        vOut: owned.utxo.vOut,
        script: owned.utxo.script,
        derivationPath,
        address: input.address,
      }
    })

    const assetLockTx = await this.identityRegistrationService.buildSignedAssetLock({
      inputs,
      lockAmount: lockAmountDuffs,
      creditAddress,
      changeAddress,
      inputTotal: selection.inputTotal,
      mnemonic,
      network,
    })
    const assetLockTxid = assetLockTx.hash()

    // Commit the asset lock on L1, then wait for its instant/chain lock proof.
    await provider.broadcastTx(assetLockTx)

    const watchAddresses = inputs.map(input => input.address)
    const assetLockProof = await this.identityRegistrationService.waitForAssetLockProof(
      assetLockTx,
      assetLockTxid,
      watchAddresses,
      network,
    )

    const identityKeys = await this.identityRegistrationService.deriveIdentityKeys(mnemonic, identityIndex, network)
    const stateTransition = this.identityRegistrationService.buildIdentityCreateTransition(
      identityKeys,
      registrationKey,
      assetLockProof,
      network,
    )

    const identifier = stateTransition.getOwnerId()?.base58()
    if (identifier == null || identifier === '') {
      throw new Error('Could not derive identity identifier from state transition')
    }
    const stateTransitionHash = stateTransition.hash(false)

    // Persist before broadcasting so a crash leaves a recoverable record. Roll
    // back on a non-idempotent broadcast failure so local state never holds a
    // phantom identity. A pre-existing record (a previous attempt) is treated
    // as recovery.
    const coinType = network === 'mainnet' ? 5 : 1
    const existing = await this.identityDAO.getByIdentifier(walletId, identifier)
    let wasJustCreated = false
    if (existing == null) {
      await this.identityDAO.insertIdentity({
        walletId,
        identityIndex,
        identifier,
        derivationPath: `m/9'/${coinType}'/0'/0/${identityIndex}`,
      }, assetLockTxid)
      wasJustCreated = true
    }

    const platformSDK = this.sdkProvider.getPlatformSDK(network)
    let alreadyOnPlatform = false
    try {
      await platformSDK.stateTransitions.broadcast(stateTransition)
    } catch (e) {
      if (this.isAlreadyInChain(e)) {
        alreadyOnPlatform = true
      } else {
        if (wasJustCreated) {
          await this.identityDAO.removeIdentity(walletId, identifier)
        }
        throw e
      }
    }

    if (!alreadyOnPlatform) {
      await platformSDK.stateTransitions.waitForStateTransitionResult(stateTransition)
    }

    return {identifier, stateTransitionHash}
  }

  // Next unused change address, falling back to the last change address (or the
  // first receiving address) so change never leaves the wallet.
  private pickChangeAddress(grouped: GroupedAddresses): string {
    const unusedChange = grouped.change.find(a => !a.isUsed)
    if (unusedChange) return unusedChange.address
    if (grouped.change.length > 0) return grouped.change[grouped.change.length - 1].address
    if (grouped.receiving.length > 0) return grouped.receiving[0].address
    throw new Error('Wallet has no change address')
  }

  private isAlreadyInChain(e: unknown): boolean {
    const message = e instanceof Error ? e.message : String(e ?? '')
    return message.includes(ALREADY_IN_CHAIN_MESSAGE)
  }
}
