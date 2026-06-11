import {describe, it, expect} from 'vitest'
import {Script} from 'dash-core-sdk'
import {CoreTransactionService, SpendableUtxo} from '../../src/main/src/services/CoreTransactionService'
import {Address} from '../../src/main/src/types/Address'

const service = new CoreTransactionService({} as never)

// Valid Dash base58 vectors, all built from the same 20-byte 0x01 hash:
//   testnet pubkey prefix 140, testnet script prefix 19, mainnet pubkey prefix 76.
const TESTNET_P2PKH = 'yLQkj9a5TNjotA96dLkkEuc67JzLvi9DbJ'
const TESTNET_P2SH = '8eWmb1WDYYfnviGcfaTBZjftxGpCwriip5'
const MAINNET_P2PKH = 'Xan9iCVe1q5jYRDZ4VSMCtBjq2VyQA3Dge'
const HASH20_HEX = '01'.repeat(20)

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

function realInputUtxo(satoshis: bigint): SpendableUtxo {
  return {
    utxo: {
      txId: 'aa'.repeat(32),
      vOut: 0,
      satoshis,
      // The prevout script is irrelevant to the recipient-output assertions;
      // it only needs to be a valid Script so the tx serializes.
      script: Script.fromHex('76a914' + '11'.repeat(20) + '88ac'),
    },
    address: address(TESTNET_P2PKH),
  }
}

describe('CoreTransactionService', () => {
  it('selects UTXOs largest-first until amount plus fee is covered', () => {
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

  describe('classifyRecipientAddress', () => {
    it('classifies a testnet P2PKH address', () => {
      expect(service.classifyRecipientAddress(TESTNET_P2PKH, 'testnet')).toBe('p2pkh')
    })

    it('classifies a testnet P2SH address', () => {
      expect(service.classifyRecipientAddress(TESTNET_P2SH, 'testnet')).toBe('p2sh')
    })

    it('rejects a mainnet address on a testnet wallet', () => {
      expect(() => service.classifyRecipientAddress(MAINNET_P2PKH, 'testnet'))
        .toThrow('not a valid testnet address')
    })

    it('rejects a malformed address', () => {
      expect(() => service.classifyRecipientAddress('not-an-address', 'testnet'))
        .toThrow('Invalid recipient address')
    })
  })

  describe('estimateFee', () => {
    it('mirrors the SDK size constants (overhead + inputs + outputs)', () => {
      // 10 overhead + 1 * 156 input + 2 * 62 outputs = 290, at FEE_PER_BYTE = 1
      expect(service.estimateFee(1, 2)).toBe(290n)
      expect(service.estimateFee(2, 2)).toBe(446n)
    })
  })

  describe('buildTransfer', () => {
    it('builds a P2PKH recipient output for a p2pkh address', () => {
      const tx = service.buildTransfer(
        [realInputUtxo(100_000n)], TESTNET_P2PKH, 'p2pkh', 10_000n, [address(TESTNET_P2PKH)], 100_000n,
      )
      expect(tx.outputs[0].script.hex()).toBe('76a914' + HASH20_HEX + '88ac')
    })

    it('builds a P2SH recipient output for a p2sh address', () => {
      const tx = service.buildTransfer(
        [realInputUtxo(100_000n)], TESTNET_P2SH, 'p2sh', 10_000n, [address(TESTNET_P2PKH)], 100_000n,
      )
      expect(tx.outputs[0].script.hex()).toBe('a914' + HASH20_HEX + '87')
    })
  })
})
