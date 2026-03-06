import type { Knex } from 'knex'
import { Address } from '../types/Address'

function fromRow ({ wallet_id, account_id, address, derivation_path, index, is_change }): Address {
  return { walletId: wallet_id, accountId: account_id, address, derivationPath: derivation_path, index, isChange: is_change }
}

export class AddressDAO {
  knex: Knex

  constructor(knex: Knex) {
    this.knex = knex
  }

  insertAddresses = async (addresses: Address[]) => {
    await this.knex('addresses').insert(
      addresses.map(e => ({
        wallet_id: e.walletId,
        account_id: e.accountId,
        address: e.address,
        derivation_path: e.derivationPath,
        index: e.index,
        is_change: e.isChange
      }))
    )
  }

  getAddressesByWalletId = async (walletId: string): Promise<Address[]> => {
    const rows = await this.knex('addresses')
      .select('wallet_id', 'account_id', 'address', 'derivation_path', 'index', 'is_change')
      .where('wallet_id', walletId)
      .orderBy('index', 'asc')

    return rows.map(fromRow)
  }
}
