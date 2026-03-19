import type { Knex } from 'knex'
import { Identity } from '../types/Identity'

function fromRow ({ wallet_id, identity_index, public_key_hash, derivation_path }): Identity {
  return { walletId: wallet_id, identityIndex: identity_index, publicKeyHash: public_key_hash, derivationPath: derivation_path }
}

export class IdentityDAO {
  knex: Knex

  constructor(knex: Knex) {
    this.knex = knex
  }

  insertIdentities = async (identities: Identity[]) => {
    await this.knex('identities').insert(
      identities.map(e => ({
        wallet_id: e.walletId,
        identity_index: e.identityIndex,
        public_key_hash: e.publicKeyHash,
        derivation_path: e.derivationPath
      }))
    )
  }

  getIdentitiesByWalletId = async (walletId: string): Promise<Identity[]> => {
    const rows = await this.knex('identities')
      .select('wallet_id', 'identity_index', 'public_key_hash', 'derivation_path')
      .where('wallet_id', walletId)
      .orderBy('identity_index', 'asc')

    return rows.map(fromRow)
  }
}
