import {describe, it, expect} from 'vitest'
import {utils as sdkUtils} from 'dash-core-sdk'
import {CoreTransactionService} from '../../src/main/src/services/CoreTransactionService'

// assertRecipientAddress only touches the SDK's pure address utils, so the
// service can be built with a stub SDK for this suite.
const service = new CoreTransactionService({} as never)

const publicKeyHash = new Uint8Array(20).fill(1)
const testnetAddress = sdkUtils.publicKeyHashToAddress(publicKeyHash, 'testnet')
const mainnetAddress = sdkUtils.publicKeyHashToAddress(publicKeyHash, 'mainnet')

describe('CoreTransactionService.assertRecipientAddress', () => {
  it('accepts a well-formed address for the matching network', () => {
    expect(() => service.assertRecipientAddress(testnetAddress, 'testnet')).not.toThrow()
    expect(() => service.assertRecipientAddress(mainnetAddress, 'mainnet')).not.toThrow()
  })

  it('rejects a malformed address', () => {
    expect(() => service.assertRecipientAddress('not-an-address', 'testnet')).toThrow('Invalid recipient address')
  })

  it('rejects an address from the wrong network', () => {
    expect(() => service.assertRecipientAddress(mainnetAddress, 'testnet')).toThrow('not a valid testnet address')
    expect(() => service.assertRecipientAddress(testnetAddress, 'mainnet')).toThrow('not a valid mainnet address')
  })
})
