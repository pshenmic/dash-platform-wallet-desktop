import {
  ExtraPayload,
  Input,
  InstantLock,
  Output,
  PrivateKey,
  Script,
  Transaction as SDKTransaction,
  TransactionType,
  utils as coreUtils,
} from 'dash-core-sdk'
import type {ChainAssetLockProofParams, InstantAssetLockProofParams} from 'dash-core-sdk/src/utils.js'
import {KeyType, Purpose, SecurityLevel, PrivateKeyWASM, StateTransitionWASM} from 'dash-platform-sdk/types.js'
import {SdkProvider} from './SdkProvider'
import {TransferInput} from './CoreTransactionService'
import {Network} from '../types'
import {IDENTITY_LOCK_POLL_INTERVAL_MS, IDENTITY_LOCK_TIMEOUT_MS, SEQUENCE_FINAL} from '../constants'

export type AssetLockProof = InstantAssetLockProofParams | ChainAssetLockProofParams

const COIN_TYPE: Record<Network, number> = {mainnet: 5, testnet: 1}

// Upper bound on the on-chain free-index scan — guards against an infinite
// loop if Platform keeps reporting an identity for every derived auth key.
const IDENTITY_INDEX_SCAN_LIMIT = 100

// Protocol limits IdentityCreateTransition to 6 public keys. AUTH MEDIUM is
// dropped (added later via IdentityUpdateTransition if needed); MASTER /
// CRITICAL / HIGH plus ENCRYPTION / DECRYPTION / TRANSFER cover the common path.
export const IDENTITY_KEY_DEFINITIONS = [
  {id: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1},
  {id: 1, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.CRITICAL, keyType: KeyType.ECDSA_SECP256K1},
  {id: 2, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.HIGH, keyType: KeyType.ECDSA_SECP256K1},
  {id: 3, purpose: Purpose.ENCRYPTION, securityLevel: SecurityLevel.MEDIUM, keyType: KeyType.ECDSA_SECP256K1},
  {id: 4, purpose: Purpose.DECRYPTION, securityLevel: SecurityLevel.MEDIUM, keyType: KeyType.ECDSA_SECP256K1},
  {id: 5, purpose: Purpose.TRANSFER, securityLevel: SecurityLevel.CRITICAL, keyType: KeyType.ECDSA_SECP256K1},
] as const

export interface AssetLockFundingParams {
  inputs: TransferInput[]
  lockAmount: bigint
  creditAddress: string
  changeAddress: string
  inputTotal: bigint
  mnemonic: string
  network: Network
}

// Domain primitives for L1 asset-lock + Platform identity-create. Orchestration
// (decrypt, UTXO selection, broadcast, persistence) lives in the controller.
export class IdentityRegistrationService {
  constructor(private readonly sdkProvider: SdkProvider) {}

  // Registration key (DIP-0013 m/9'/coin'/5'/1'/index): owns the asset-lock
  // credit output and signs the IdentityCreateTransition. Derived from seed, so
  // recoverable without local storage.
  async deriveRegistrationKey(mnemonic: string, identityIndex: number, network: Network): Promise<PrivateKeyWASM> {
    const keyPair = this.sdkProvider.getPlatformSDK(network).keyPair
    const hdKey = keyPair.seedToHdKey(keyPair.mnemonicToSeed(mnemonic), network)
    const coinType = COIN_TYPE[network]
    const {privateKey} = await keyPair.derivePath(hdKey, `m/9'/${coinType}'/5'/1'/${identityIndex}`)
    if (privateKey == null) {
      throw new Error('Could not derive identity registration key from wallet hd key')
    }
    return PrivateKeyWASM.fromBytes(privateKey, network)
  }

  // The 6 identity public keys (DIP-0013), each later used for proof-of-possession.
  async deriveIdentityKeys(mnemonic: string, identityIndex: number, network: Network): Promise<PrivateKeyWASM[]> {
    const keyPair = this.sdkProvider.getPlatformSDK(network).keyPair
    const hdKey = keyPair.seedToHdKey(keyPair.mnemonicToSeed(mnemonic), network)

    return IDENTITY_KEY_DEFINITIONS.map(({id}) => {
      const derived = keyPair.deriveIdentityPrivateKey(hdKey, identityIndex, id, network)
      if (derived.privateKey == null) {
        throw new Error(`Could not derive identity key ${id}`)
      }
      return PrivateKeyWASM.fromBytes(derived.privateKey, network)
    })
  }

  // First index at/after startIndex whose auth key #0 is not already registered
  // on Platform — skips indices taken by the same seed used elsewhere.
  async findNextIdentityIndex(mnemonic: string, startIndex: number, network: Network): Promise<number> {
    const sdk = this.sdkProvider.getPlatformSDK(network)
    const hdKey = sdk.keyPair.seedToHdKey(sdk.keyPair.mnemonicToSeed(mnemonic), network)

    let index = startIndex
    for (let scanned = 0; scanned < IDENTITY_INDEX_SCAN_LIMIT; scanned++) {
      const derived = sdk.keyPair.deriveIdentityPrivateKey(hdKey, index, 0, network)
      if (derived.privateKey == null) {
        throw new Error(`Could not derive identity key at index ${index}`)
      }
      const pkh = PrivateKeyWASM.fromBytes(derived.privateKey, network).getPublicKeyHash()

      const existing =
        await sdk.identities.getIdentityByPublicKeyHash(pkh).catch(() => null) ??
        await sdk.identities.getIdentityByNonUniquePublicKeyHash(pkh).catch(() => null)

      if (existing == null) {
        return index
      }
      index++
    }
    throw new Error(`Could not find a free identity index within ${IDENTITY_INDEX_SCAN_LIMIT} attempts`)
  }

  // Builds and signs the L1 asset-lock transaction funded from wallet UTXOs.
  // Output 0 is the OP_RETURN asset-lock output whose value becomes credits;
  // change (if any) is appended after it (so the proof's outputIndex stays 0).
  // The credit output in the asset-lock payload directs the credits to
  // creditAddress (the registration key).
  async buildSignedAssetLock(params: AssetLockFundingParams): Promise<SDKTransaction> {
    const {inputs, lockAmount, creditAddress, changeAddress, inputTotal, mnemonic, network} = params
    const keyPair = this.sdkProvider.getPlatformSDK(network).keyPair
    const hdKey = keyPair.seedToHdKey(keyPair.mnemonicToSeed(mnemonic), network)

    const creditOutput = Output.createP2PKH(lockAmount, creditAddress)
    const transaction = new SDKTransaction(
      [],
      [new Output(lockAmount, Script.fromASM('OP_RETURN OP_0'))],
      undefined,
      undefined,
      TransactionType.TRANSACTION_ASSET_LOCK,
      new ExtraPayload.AssetLockTx(1, 1, [creditOutput]),
    )

    const privateKeys: PrivateKey[] = []
    for (const input of inputs) {
      transaction.addInput(new Input(input.txId, input.vOut, input.script, SEQUENCE_FINAL))

      const derived = await keyPair.derivePath(hdKey, input.derivationPath)
      if (!derived.privateKey) {
        throw new Error(`Failed to derive private key for ${input.address}`)
      }
      privateKeys.push(PrivateKey.fromBytes(derived.privateKey as Uint8Array, network, true))
    }

    transaction.generateChange(changeAddress, inputTotal)
    transaction.sign(privateKeys)
    return transaction
  }

  // Waits for the asset-lock tx to receive an instant lock (fast) or chain lock
  // (fallback) and returns the matching proof. RPC polling backs the chain-lock
  // race because chain-lock events can be missed; the instant-lock race reads
  // the islock subscription. First to resolve wins.
  async waitForAssetLockProof(
    assetLockTx: SDKTransaction,
    txid: string,
    watchAddresses: string[],
    network: Network,
    pollIntervalMs: number = IDENTITY_LOCK_POLL_INTERVAL_MS,
    timeoutMs: number = IDENTITY_LOCK_TIMEOUT_MS,
  ): Promise<AssetLockProof> {
    const coreSDK = this.sdkProvider.getCoreSDK(network)
    const platformSDK = this.sdkProvider.getPlatformSDK(network)
    const subscription = coreSDK.subscribeToTransactions(watchAddresses, [coreUtils.hexToBytes(txid)])

    let settled = false

    const instantLockRace = async (): Promise<AssetLockProof> => {
      for await (const event of subscription) {
        if (settled) throw new Error('cancelled')
        if (event.event !== 'instantSendLockMessage') continue

        let instantLock: InstantLock
        try {
          instantLock = InstantLock.fromHex(event.data)
        } catch {
          continue
        }
        if (instantLock.txId !== txid) continue

        return coreUtils.createAssetLockProof({transaction: assetLockTx, instantLock, outputIndex: 0}) as InstantAssetLockProofParams
      }
      throw new Error('Instant lock subscription ended without result')
    }

    const chainLockRace = async (): Promise<AssetLockProof> => {
      const deadline = Date.now() + timeoutMs

      while (Date.now() < deadline) {
        if (settled) throw new Error('cancelled')

        try {
          const dapiTx = await coreSDK.getTransaction(txid)

          if (dapiTx.isChainLocked) {
            const requiredHeight = dapiTx.height

            while (Date.now() < deadline) {
              if (settled) throw new Error('cancelled')

              try {
                const nodeStatus = await platformSDK.node.status()
                const latestHeight = nodeStatus.chain?.coreChainLockedHeight ?? 0

                if (Number.isSafeInteger(latestHeight) && latestHeight >= requiredHeight) {
                  return coreUtils.createAssetLockProof({transaction: assetLockTx, coreChainLockedHeight: dapiTx.height, outputIndex: 0}) as ChainAssetLockProofParams
                }
              } catch {
                // Platform node status unavailable — keep polling until deadline.
              }

              await coreUtils.wait(pollIntervalMs)
            }
          }
        } catch {
          // Asset lock tx not yet visible on DAPI — keep polling until deadline.
        }

        await coreUtils.wait(pollIntervalMs)
      }

      throw new Error(`Timed out waiting for asset lock proof on transaction ${txid} after ${Math.round(timeoutMs / 1000)}s`)
    }

    try {
      return await Promise.race([instantLockRace(), chainLockRace()])
    } finally {
      settled = true
    }
  }

  // Builds and signs the IdentityCreateTransition. Two-pass signing: each
  // identity key signs for proof-of-possession (each signByPrivateKey overwrites
  // the same WASM signature slot, so it is copied out immediately), then the ST
  // is rebuilt with the signed keys and signed by the registration key.
  buildIdentityCreateTransition(
    identityPrivateKeys: PrivateKeyWASM[],
    registrationKey: PrivateKeyWASM,
    assetLockProof: AssetLockProof,
    network: Network,
  ): StateTransitionWASM {
    const sdk = this.sdkProvider.getPlatformSDK(network)

    const publicKeys = IDENTITY_KEY_DEFINITIONS.map(({id, purpose, securityLevel, keyType}, i) => ({
      id,
      purpose,
      securityLevel,
      keyType,
      readOnly: false,
      data: Uint8Array.from(identityPrivateKeys[i].getPublicKey().bytes()),
      signature: undefined as Uint8Array | undefined,
    }))

    let stateTransition = sdk.identities.createStateTransition('create', {publicKeys, assetLockProof})

    for (let i = 0; i < identityPrivateKeys.length; i++) {
      stateTransition.signByPrivateKey(identityPrivateKeys[i], undefined, IDENTITY_KEY_DEFINITIONS[i].keyType)
      if (stateTransition.signature == null) {
        throw new Error(`signByPrivateKey did not produce a signature for identity key ${i}`)
      }
      publicKeys[i].signature = Uint8Array.from(stateTransition.signature)
    }

    stateTransition = sdk.identities.createStateTransition('create', {publicKeys, assetLockProof})
    stateTransition.signByPrivateKey(registrationKey, undefined, KeyType.ECDSA_SECP256K1)

    return stateTransition
  }
}
