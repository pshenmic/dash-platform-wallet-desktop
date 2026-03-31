import { Identity } from '../types/Identity'
import {KnexProvider} from "../providers/knexProvider";

function identityFromRow ({ wallet_id, identity_index, identifier, derivation_path }): Identity {
  return { walletId: wallet_id, identityIndex: identity_index, identifier, derivationPath: derivation_path }
}

export class IdentityDAO {
  private knexProvider: KnexProvider

  constructor(knexProvider: KnexProvider) {
    this.knexProvider = knexProvider
  }

  insertIdentities = async (identities: Identity[]): Promise<void> => {
    await this.knexProvider.knex('identities').insert(
      identities.map(e => ({
        wallet_id: e.walletId,
        identity_index: e.identityIndex,
        derivation_path: e.derivationPath,
        identifier: e.identifier,
      }))
    )
  }

  getIdentitiesByWalletId = async (walletId: string): Promise<Identity[]> => {
    const rows = await this.knexProvider.knex('identities')
      .select('wallet_id', 'identity_index', 'identifier', 'derivation_path')
      .where('wallet_id', walletId)
      .orderBy('identity_index', 'asc')

    return rows.map(identityFromRow)
  }
}
