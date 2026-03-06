import { Wallet } from '../types/Wallet'

function fromRow ({ wallet_id, label, network, encrypted_mnemonic, selected }): Wallet {
  return { walletId: wallet_id, network, label, encryptedMnemonic: encrypted_mnemonic, selected: Boolean(selected) }
}

export class WalletDAO {
  knex

  constructor (knex) {
    this.knex = knex
  }

  saveWallet = async (mnemonic, walletId, network, label) => {
    await this.knex('wallet')
      .insert({
        network,
        label,
        encrypted_mnemonic: mnemonic,
        wallet_id: walletId
      })
  }

  getWalletById = async (walletId) => {
    const rows = await this.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')
      .where('wallet_id', walletId)
      .limit(1)

    if (rows.length === 0) {
      return null
    }

    const [row] = rows

    return fromRow(row)
  }

  getAllWallets = async (): Promise<Wallet[]> => {
    const rows = await this.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')

    return rows.map(fromRow)
  }

  getSelectedWallet = async (): Promise<Wallet | null> => {
    const rows = await this.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')
      .where('selected', true)
      .limit(1)

    if (rows.length === 0) {
      return null
    }

    return fromRow(rows[0])
  }

  getWalletsByNetwork = async (network) => {
    const rows = await this.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')
      .where('network', network)

    return rows.map(fromRow)
  }
}
