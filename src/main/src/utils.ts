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
