import {randomBytes} from "node:crypto";
import {PBKDF2_SALT_LENGTH, PBKDF2_TARGET_MS} from "./constants";
import fs from "fs/promises";
import {calibratePBKDF2Iterations} from "./utils";

interface PreferencesData {
  version: number
  pbkdf2Iterations: number
  pbkdf2Salt: string
}

export class Preferences {
  static readonly CURRENT_VERSION = 2

  // =====================================================
  // ANY CHANGES IN PREFERENCES REQUIRE BUMP VERSION ABOVE
  // =====================================================
  pbkdf2Iterations!: number
  pbkdf2Salt!: string

  private path: string | null = null

  version!: number

  private constructor() {/**/}

  static async init(path?: string): Promise<Preferences> {
    if (path == null) {
      console.warn(`Preferences path not set. Using RAM`)
      return Preferences.getDefaultValue()
    }

    let fileExists: boolean
    try {
      // check if file exist and we can read it (permissions)
      await fs.access(path)
      fileExists = true
    } catch {
      fileExists = false
    }

    let preferences: Preferences

    if (!fileExists) {
      console.log('Preferences file not exists. Creating Preferences')
      preferences = await Preferences.createAndWrite(path)
    } else {
      preferences = await Preferences.readFromFile(path)
    }

    preferences.path = path

    return preferences
  }

  private static async readFromFile(path: string): Promise<Preferences> {
    let rawConfig: Record<string, unknown>
    try {
      const content = await fs.readFile(path, 'utf-8')
      rawConfig = JSON.parse(content)
    } catch (err) {
      // TODO: We need to throw this error to frontend
      console.error('Failed to read preferences file, backup corrupted file, recreating with defaults:', err)

      const corruptedPath = `${path}.error-${Date.now()}`
      await fs.rename(path, corruptedPath)

      return Preferences.createAndWrite(path)
    }

    const preferences = Preferences.migrate(rawConfig)

    // migration mechanism
    // needed for app updates which change preferences fields
    if (preferences.version !== (rawConfig.version ?? 0)) {
      console.log(`Preferences migrated from v${rawConfig.version ?? 0} to v${preferences.version}`)
      await fs.writeFile(path, JSON.stringify(preferences))
    }

    return preferences
  }

  private static migrate(raw: Record<string, unknown>): Preferences {
    const defaults = Preferences.getDefaultValue()

    const merged = {...defaults, ...raw}

    merged.version = Preferences.CURRENT_VERSION

    return Preferences.fromObject(merged as unknown as PreferencesData)
  }

  private static async createAndWrite(path: string): Promise<Preferences> {
    const preferences = Preferences.getDefaultValue()
    preferences.pbkdf2Iterations = calibratePBKDF2Iterations(PBKDF2_TARGET_MS)

    await fs.writeFile(path, JSON.stringify(preferences))

    return preferences
  }

  async update(): Promise<void> {
    if (this.path != null) {
      await fs.writeFile(this.path, JSON.stringify(this))
    }
  }

  static getDefaultValue(): Preferences {
    const instance = new Preferences()

    instance.version = Preferences.CURRENT_VERSION
    instance.pbkdf2Iterations = 100_000
    instance.pbkdf2Salt = randomBytes(PBKDF2_SALT_LENGTH).toString('base64')

    return instance
  }

  static fromObject({version, pbkdf2Iterations, pbkdf2Salt}: PreferencesData): Preferences {
    const instance = new Preferences()

    instance.version = version
    instance.pbkdf2Iterations = pbkdf2Iterations
    instance.pbkdf2Salt = pbkdf2Salt

    return instance
  }
}
