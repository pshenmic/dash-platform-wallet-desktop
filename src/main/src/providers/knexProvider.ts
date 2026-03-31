import knex, {Knex} from "knex";
import path from "path";
import {SqlcipherClient} from "../sqlcipherClient";
import {OperationStatus} from "../types/OperationStatus";

/* eslint-disable  @typescript-eslint/no-explicit-any */
// TODO: Implement status changes like destroy by timeout
export class KnexProvider {
  private _knex: Knex | null = null

  constructor () { /* empty */ }

  async setKnex(secret: string, dbPath?: string): Promise<OperationStatus> {
    if (this._knex != null) {
      await this._knex.destroy()
      this._knex = null
    }

    const instance = knex({
      client: SqlcipherClient as any,
      connection: {
        filename: dbPath ?? ':memory:',
        key: secret,
      } as any,
      migrations: {
        directory: path.join(process.cwd(), 'src/main/migrations')
      },
      useNullAsDefault: true,
    })

    // Verify the key by reading the schema. SQLCipher throws
    // "file is not a database" here if the password is wrong.
    try {
      await instance.raw('SELECT count(*) FROM sqlite_master')
    } catch (e: unknown){
      if((e as {code: string}).code === 'SQLITE_NOTADB') {
        await instance.destroy()
        return {
          success: false,
          errorMessage: 'Invalid password',
        }
      } else {
        return {
          success: false,
          errorMessage: (e as {message: string}).message,
        }
      }
    }

    this._knex = instance
    await this._knex.migrate.latest()

    return {
      success: true,
      errorMessage: null,
    }
  }

  async changePassword(newSecret: string): Promise<OperationStatus> {
    if (this._knex == null) {
      return {
        success: false,
        errorMessage: 'Database is not open',
      }
    }

    const escapedNew = newSecret.replace(/'/g, "''")

    try {
      await this._knex.raw(`PRAGMA rekey = '${escapedNew}'`)
    } catch (e: unknown) {
      console.error(e)
      return {
        success: false,
        errorMessage: (e as { message: string }).message,
      }
    }

    return {
      success: true,
      errorMessage: null,
    }
  }

  async destroy(): Promise<OperationStatus> {
    try {
      if(this._knex != null) {
        await this._knex.destroy()
        this._knex = null

        return {
          success: true,
          errorMessage: null,
        }
      } else {
        return {
          success: false,
          errorMessage: "Knex is not set",
        }
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: (error as {message: string}).message,
      }
    }
  }

  get knex (): Knex {
    if (this._knex == null) {
      throw new Error('Knex was not been set')
    }
    return this._knex
  }
}

