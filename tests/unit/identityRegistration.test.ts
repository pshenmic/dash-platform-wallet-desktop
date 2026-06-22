import {describe, it, expect, vi} from 'vitest'
import {Output, Script, TransactionType} from 'dash-core-sdk'
import {SdkProvider} from '../../src/main/src/services/SdkProvider'
import {IdentityRegistrationService, IDENTITY_KEY_DEFINITIONS, TransferInput} from '../../src/main/src/services/IdentityRegistrationService'

const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
// Valid testnet P2PKH base58 vectors (version byte 140).
const CREDIT_ADDRESS = 'yLQkj9a5TNjotA96dLkkEuc67JzLvi9DbJ'
const CHANGE_ADDRESS = 'yLW4c6QpWVbxGdm4pwssbG736zudM2Mxrw'

function realInput(): TransferInput {
  return {
    txId: 'aa'.repeat(32),
    vOut: 0,
    script: Script.fromHex('76a914' + '11'.repeat(20) + '88ac'),
    derivationPath: "m/44'/1'/0'/0/0",
    address: CHANGE_ADDRESS,
  }
}

describe('IdentityRegistrationService', () => {
  const service = new IdentityRegistrationService(new SdkProvider())

  describe('key derivation', () => {
    it('derives distinct registration keys per identity index', async () => {
      const key0 = await service.deriveRegistrationKey(MNEMONIC, 0, 'testnet')
      const key1 = await service.deriveRegistrationKey(MNEMONIC, 1, 'testnet')

      expect(key0.hex()).not.toBe(key1.hex())
      // Deterministic: same index → same key.
      const key0Again = await service.deriveRegistrationKey(MNEMONIC, 0, 'testnet')
      expect(key0Again.hex()).toBe(key0.hex())
    })

    it('derives all 6 identity keys, each distinct', async () => {
      const keys = await service.deriveIdentityKeys(MNEMONIC, 0, 'testnet')

      expect(keys).toHaveLength(IDENTITY_KEY_DEFINITIONS.length)
      const hexes = new Set(keys.map(k => k.hex()))
      expect(hexes.size).toBe(IDENTITY_KEY_DEFINITIONS.length)
    })
  })

  describe('buildSignedAssetLock', () => {
    it('builds an asset-lock tx with OP_RETURN lock output, change, and credit payload', async () => {
      const lockAmount = 100_000n
      const inputTotal = 200_000n

      const tx = await service.buildSignedAssetLock({
        inputs: [realInput()],
        lockAmount,
        creditAddress: CREDIT_ADDRESS,
        changeAddress: CHANGE_ADDRESS,
        inputTotal,
        mnemonic: MNEMONIC,
        network: 'testnet',
      })

      // Special asset-lock transaction type.
      expect(tx.type).toBe(TransactionType.TRANSACTION_ASSET_LOCK)

      // Output 0 is the OP_RETURN asset-lock output (value becomes credits, no address).
      expect(tx.outputs[0].satoshis).toBe(lockAmount)
      expect(tx.outputs[0].getAddress('testnet')).toBeUndefined()

      // Output 1 is wallet change.
      expect(tx.outputs).toHaveLength(2)
      expect(tx.outputs[1].getAddress('testnet')).toBe(CHANGE_ADDRESS)

      // Credit output in the asset-lock payload directs credits to the credit address.
      const payload = tx.extraPayload as unknown as {outputs: Output[]}
      expect(payload.outputs).toHaveLength(1)
      expect(payload.outputs[0].satoshis).toBe(lockAmount)
      expect(payload.outputs[0].getAddress('testnet')).toBe(CREDIT_ADDRESS)

      // Signed and serializable.
      expect(tx.inputs).toHaveLength(1)
      expect(typeof tx.hex()).toBe('string')
      expect(tx.hex().length).toBeGreaterThan(0)
    })
  })

  describe('findNextIdentityIndex', () => {
    it('returns the start index when no identity is registered', async () => {
      const sdkProvider = new SdkProvider()
      const sdk = sdkProvider.getPlatformSDK('testnet')
      vi.spyOn(sdk.identities, 'getIdentityByPublicKeyHash').mockRejectedValue(new Error('offline'))
      vi.spyOn(sdk.identities, 'getIdentityByNonUniquePublicKeyHash').mockRejectedValue(new Error('offline'))

      const localService = new IdentityRegistrationService(sdkProvider)
      const index = await localService.findNextIdentityIndex(MNEMONIC, 0, 'testnet')

      expect(index).toBe(0)
    })

    it('skips an index whose auth key is already registered', async () => {
      const sdkProvider = new SdkProvider()
      const sdk = sdkProvider.getPlatformSDK('testnet')
      vi.spyOn(sdk.identities, 'getIdentityByPublicKeyHash')
        .mockResolvedValueOnce({} as never)
        .mockResolvedValue(null as never)
      vi.spyOn(sdk.identities, 'getIdentityByNonUniquePublicKeyHash').mockResolvedValue(null as never)

      const localService = new IdentityRegistrationService(sdkProvider)
      const index = await localService.findNextIdentityIndex(MNEMONIC, 0, 'testnet')

      expect(index).toBe(1)
    })
  })
})
