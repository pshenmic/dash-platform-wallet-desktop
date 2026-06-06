import {describe, it, expect} from 'vitest'
import {CoreTransactionService, SpendableUtxo} from '../../src/main/src/services/CoreTransactionService'
import {Address} from '../../src/main/src/types/Address'

const service = new CoreTransactionService({} as never)

function address(addressValue: string, isUsed = false): Address {
  return {
    walletId: 'wallet-1',
    accountId: 0,
    address: addressValue,
    derivationPath: "m/44'/1'/0'/0/0",
    index: 0,
    isChange: true,
    isUsed,
    label: null,
  }
}

function spendableUtxo(satoshis: bigint): SpendableUtxo {
  return {
    utxo: {
      txId: `tx-${satoshis}`,
      vOut: 0,
      satoshis,
      script: {} as never,
    },
    address: address(`address-${satoshis}`),
  }
}

// Change-address selection is exercised end-to-end via SendCoinsHandler
// tests (which mock buildTransfer and assert it receives the full change
// candidate list). Behavior verification of buildTransfer itself requires
// real dash-core-sdk Script/Input/Output objects and is left to
// integration testing.
describe('CoreTransactionService', () => {
  it('selects UTXOs largest-first until amount plus fee headroom is covered', () => {
    const small = spendableUtxo(500n)
    const large = spendableUtxo(1_000n)
    const medium = spendableUtxo(700n)

    const utxoSelection = service.selectUtxosGreedy([small, large, medium], 900n)

    expect(utxoSelection.utxos).toEqual([large, medium])
    expect(utxoSelection.totalIn).toBe(1_700n)
  })

  it('does not mutate the candidate UTXO order while selecting', () => {
    const small = spendableUtxo(500n)
    const large = spendableUtxo(1_000n)
    const candidates = [small, large]

    service.selectUtxosGreedy(candidates, 900n)

    expect(candidates).toEqual([small, large])
  })
})
