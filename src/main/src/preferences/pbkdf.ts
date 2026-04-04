import {randomBytes} from "node:crypto";
import {PBKDF2_SALT_LENGTH} from "../constants";

export interface PbkdfPreferencesJSON {
  iterations: number
  salt: string
}

export class PbkdfPreferences {
  iterations: number
  salt: string

  constructor(iterations: number, salt: string) {
    this.iterations = iterations
    this.salt = salt
  }

  toJSON(): PbkdfPreferencesJSON {
    return {
      iterations: this.iterations,
      salt: this.salt,
    }
  }

  static fromObject(value: PbkdfPreferencesJSON): PbkdfPreferences {
    return new PbkdfPreferences(value.iterations, value.salt)
  }

  static default(): PbkdfPreferences {
    return new PbkdfPreferences(
      100_000,
      randomBytes(PBKDF2_SALT_LENGTH).toString('base64')
    )
  }
}
