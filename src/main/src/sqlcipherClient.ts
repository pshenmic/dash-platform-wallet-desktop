import { Database } from '@signalapp/sqlcipher'
import { getDialectByNameOrAlias } from 'knex/lib/dialects/index'

const Client_BetterSQLite3 = getDialectByNameOrAlias('better-sqlite3')

/**
 * Custom knex dialect for @signalapp/sqlcipher.
 *
 * Signal's sqlcipher package has a synchronous API similar to better-sqlite3
 * but is NOT a drop-in replacement — it lacks `statement.reader` and has a
 * different constructor signature. This client bridges the gap.
 */
export class SqlcipherClient extends Client_BetterSQLite3 {
  declare connectionSettings: { filename: string; key?: string }
  // eslint-disable-next-line
  declare _formatBindings: (bindings: any[]) => any[]

  _driver(): typeof Database {
    return Database
  }

  async acquireRawConnection(): Promise<Database> {
    const db = new Database(this.connectionSettings.filename)

    if (this.connectionSettings.key) {
      const escaped = this.connectionSettings.key.replace(/'/g, "''")
      db.exec(`PRAGMA key = '${escaped}'`)
    }

    return db
  }

  async destroyRawConnection(connection: InstanceType<typeof Database>): Promise<void> {
    try {
      connection.close()
    } catch {
      // already closed
    }
  }

  // eslint-disable-next-line
  async _query(connection: InstanceType<typeof Database>, obj: any): Promise<any> {
    if (!obj.sql) throw new Error('The query is empty')
    if (!connection) throw new Error('No connection provided')

    const useBigInt = obj.options?.bigint === true
    const statement = connection.prepare(obj.sql, useBigInt ? { bigint: true } : {})
    const bindings = this._formatBindings(obj.bindings)
    const params = bindings.length > 0 ? bindings : undefined

    // @signalapp/sqlcipher statements lack the `reader` property that
    // better-sqlite3 provides, so we determine read vs write from knex's
    // query method — mirroring the logic in knex's own sqlite3 dialect.
    // For raw/unknown methods we fall back to SQL inspection.
    let useRun: boolean
    switch (obj.method) {
      case 'insert':
      case 'update':
        useRun = !obj.returning
        break
      case 'counter':
      case 'del':
        useRun = true
        break
      case 'select':
      case 'first':
      case 'pluck':
        useRun = false
        break
      default:
        useRun = isWriteStatement(obj.sql)
    }

    if (useRun) {
      const response = statement.run(params)
      obj.response = response
      obj.context = {
        lastID: response.lastInsertRowid,
        changes: response.changes,
      }
    } else {
      obj.response = statement.all(params)
    }

    return obj
  }
}

Object.assign(SqlcipherClient.prototype, {
  driverName: 'sqlcipher',
})

const WRITE_PATTERN = /^(?:INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REINDEX|REPLACE|VACUUM|ANALYZE)\b/i

function isWriteStatement(sql: string): boolean {
  const trimmed = sql.trimStart()
  // Skip leading comments (--...\n or /*...*/) and whitespace
  const stripped = trimmed
    .replace(/^--[^\n]*\n/g, '')
    .replace(/^\/\*[\s\S]*?\*\//g, '')
    .trimStart()
  return WRITE_PATTERN.test(stripped)
}
