import {Wallet} from '../types/Wallet'
import {OperationStatus} from "../types/OperationStatus";
import {KnexProvider} from "../providers/knexProvider";

function fromRow({wallet_id, label, network, encrypted_mnemonic, selected}): Wallet {
  return {walletId: wallet_id, network, label, encryptedMnemonic: encrypted_mnemonic, selected: Boolean(selected)}
}

export class WalletDAO {
  private knexProvider: KnexProvider

  constructor(knexProvider: KnexProvider) {
    this.knexProvider = knexProvider
  }

  saveWallet = async (mnemonic, walletId, network, label): Promise<OperationStatus> => {
    try {
      await this.knexProvider.knex('wallet')
        .insert({
          network,
          label,
          encrypted_mnemonic: mnemonic,
          wallet_id: walletId
        })

      return {
        success: true,
        errorMessage: null,
      }
    } catch (error) {
      let message: string

      if (error instanceof Error) {
        message = error.message
      } else {
        message = String(error)
      }

      return {
        success: false,
        errorMessage: message
      }
    }
  }

  getWalletById = async (walletId): Promise<Wallet | null> => {
    const rows = await this.knexProvider.knex('wallet')
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
    const rows = await this.knexProvider.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')

    return rows.map(fromRow)
  }

  getSelectedWallet = async (): Promise<Wallet | null> => {
    const rows = await this.knexProvider.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')
      .where('selected', true)
      .limit(1)

    if (rows.length === 0) {
      return null
    }

    return fromRow(rows[0])
  }
  setSelectedWallet = async (walletId: string): Promise<OperationStatus> => {
    return this.knexProvider.knex.transaction(async (trx) => {
      const exists = await trx('wallet')
        .where('wallet_id', walletId)
        .count('wallet_id as count')
        .first()

      if (!exists || Number(exists.count) === 0) {
        return {
          success: false,
          errorMessage: 'Wallet not found',
        }
      }

      await trx('wallet').update({selected: false})
      await trx('wallet').update({selected: true}).where('wallet_id', walletId)

      return {
        success: true,
        errorMessage: null,
      }
    })
  }

  getWalletsByNetwork = async (network): Promise<Wallet[]> => {
    const rows = await this.knexProvider.knex('wallet')
      .select('encrypted_mnemonic', 'network', 'wallet_id', 'label', 'selected')
      .where('network', network)

    return rows.map(fromRow)
  }

  deleteWallet = async (walletId: string): Promise<OperationStatus> => {
    try {
      await this.knexProvider.knex('identities')
        .delete()
        .where('wallet_id', walletId)

      await this.knexProvider.knex('addresses')
        .delete()
        .where('wallet_id', walletId)

      await this.knexProvider.knex('wallet')
        .delete()
        .where('wallet_id', walletId)

      return {
        success: true,
        errorMessage: null,
      }
    } catch (error) {
      let message: string

      if (error instanceof Error) {
        message = error.message
      } else {
        message = String(error)
      }

      return {
        success: false,
        errorMessage: message
      }
    }
  }
}
