import type { Knex } from 'knex'
import { Address } from '../types/Address'
import {GroupedAddresses} from "../types/GroupedAddresses";

function fromRow ({ wallet_id, account_id, address, derivation_path, index, is_change }): Address {
  return { walletId: wallet_id, accountId: account_id, address, derivationPath: derivation_path, index, isChange: is_change, balance: null }
}

export class AddressDAO {
  knex: Knex

  constructor(knex: Knex) {
    this.knex = knex
  }

  insertAddresses = async (addresses: Address[]): Promise<void> => {
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

  getAddressesByWalletId = async (walletId: string): Promise<GroupedAddresses> => {
    const rows = await this.knex('addresses')
      .select('wallet_id', 'account_id', 'address', 'derivation_path', 'index', 'is_change')
      .where('wallet_id', walletId)
      .orderBy('index', 'asc')

    return rows.reduce((acc, row) => {
      const address = fromRow(row)
      if (row.is_change === true) {
        return {
          ...acc,
          change: [...acc.change,address],
        }
      }else {
        return {
          ...acc,
          receiving: [...acc.receiving,address],
        }
      }
    }, {receiving: [], change: []})
  }
}
