import { Wallet } from '../types/Wallet'

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
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label')
      .where('wallet_id', walletId)
      .limit(1)

    if (rows.length === 0) {
      return null
    }

    const [row] = rows

    return Wallet.fromRow(row)
  }

  getWalletsByNetwork = async (network) => {
    const rows = await this.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label')
      .where('network', network)

    return rows.map(Wallet.fromRow)
  }
}
