import type { Knex } from 'knex'
import { Identity } from '../types/Identity'

function identityFromRow ({ wallet_id, identity_index, identifier, derivation_path }): Identity {
  return { walletId: wallet_id, identityIndex: identity_index, identifier, derivationPath: derivation_path }
}

export class IdentityDAO {
  knex: Knex

  constructor(knex: Knex) {
    this.knex = knex
  }

  insertIdentities = async (identities: Identity[]): Promise<void> => {
    await this.knex('identities').insert(
      identities.map(e => ({
        wallet_id: e.walletId,
        identity_index: e.identityIndex,
        derivation_path: e.derivationPath,
        identifier: e.identifier,
      }))
    )
  }

  getIdentitiesByWalletId = async (walletId: string): Promise<Identity[]> => {
    const rows = await this.knex('identities')
      .select('wallet_id', 'identity_index', 'identifier', 'derivation_path')
      .where('wallet_id', walletId)
      .orderBy('identity_index', 'asc')

    return rows.map(identityFromRow)
  }
}
