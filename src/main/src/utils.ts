import fs from 'fs'
import os from 'os'
import path from 'path'
import { HomeFolderName } from './constants'
import knex from 'knex'

export function getKnex (path?: string) {
  return knex({
    client: 'sqlite3',
    connection: {
      filename: path ?? ':memory:'
    },
    useNullAsDefault: true
  })
}

export async function migrateKnex (knex, migrationsPath) {
  await knex.migrate.latest({
    directory: migrationsPath.toString()
  })
}

export function ensureHomeFolder () {
  if (!fs.existsSync(path.join(os.homedir(), HomeFolderName))) {
    fs.mkdirSync(path.join(os.homedir(), HomeFolderName))
  }
}

export const fetchIdentitiesBySeed = async (seed: Uint8Array, sdk: DashPlatformSDK, network: Network): Promise<IdentityWASM[]> => {
  const walletHDKey = sdk.keyPair.seedToHdKey(seed, network)

  const identities = []

  let identity = null
  let identityIndex = 0

  do {
    const hdKey = sdk.keyPair.deriveIdentityPrivateKey(walletHDKey, identityIndex, 0, network)
    const privateKey = hdKey.privateKey

    if (privateKey == null) {
      throw new Error('Could not derive private key from wallet hd key')
    }

    const pkh = PrivateKeyWASM.fromBytes(privateKey, network).getPublicKeyHash()

    let uniqueIdentity

    try {
      uniqueIdentity = await sdk.identities.getIdentityByPublicKeyHash(pkh)
    } catch (e) {
    }

    let nonUniqueIdentity

    try {
      nonUniqueIdentity = await sdk.identities.getIdentityByNonUniquePublicKeyHash(pkh)
    } catch (e) {
    }

    [identity] = [uniqueIdentity, nonUniqueIdentity].filter(e => e != null)

    if (identity != null) {
      identities.push(identity)
    }

    identityIndex = identityIndex + 1
  } while (identity != null)

  return identities
}
