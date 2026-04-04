import {PBKDF2_TARGET_MS} from "../constants";
import fs from "fs/promises";
import {calibratePBKDF2Iterations} from "../utils";
import {PbkdfPreferences, PbkdfPreferencesJSON} from "./pbkdf";

interface PreferencesData {
  version: number
  pbkdfPreferences: PbkdfPreferencesJSON
}

export class Preferences {
  static readonly CURRENT_VERSION = 2

  // =====================================================
  // ANY CHANGES IN PREFERENCES REQUIRE BUMP VERSION ABOVE
  // =====================================================
  pbkdfPreferences!: PbkdfPreferences

  private path: string | null = null

  version!: number

  private constructor() {/**/}

  static async init(path?: string): Promise<Preferences> {
    if (path == null) {
      console.warn(`Preferences path not set. Using RAM`)
      return Preferences.default()
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
    const defaults = Preferences.default()
    const rawPbkdf = (raw.pbkdfPreferences ?? {}) as Partial<PbkdfPreferencesJSON>

    const instance = new Preferences()
    instance.version = Preferences.CURRENT_VERSION
    instance.pbkdfPreferences = new PbkdfPreferences(
      rawPbkdf.iterations ?? defaults.pbkdfPreferences.iterations,
      rawPbkdf.salt ?? defaults.pbkdfPreferences.salt,
    )

    return instance
  }

  private static async createAndWrite(path: string): Promise<Preferences> {
    const preferences = Preferences.default()
    preferences.pbkdfPreferences.iterations = calibratePBKDF2Iterations(PBKDF2_TARGET_MS)

    await fs.writeFile(path, JSON.stringify(preferences))

    return preferences
  }

  async update(): Promise<void> {
    if (this.path != null) {
      await fs.writeFile(this.path, JSON.stringify(this))
    }
  }

  static default(): Preferences {
    const instance = new Preferences()

    instance.version = Preferences.CURRENT_VERSION
    instance.pbkdfPreferences = PbkdfPreferences.default()

    return instance
  }

  static fromObject({version, pbkdfPreferences}: PreferencesData): Preferences {
    const instance = new Preferences()

    instance.version = version
    instance.pbkdfPreferences = PbkdfPreferences.fromObject(pbkdfPreferences)

    return instance
  }
}
