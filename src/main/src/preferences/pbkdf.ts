export interface PbkdfPreferencesJSON {
  iterations: number
}

export class PbkdfPreferences {
  iterations: number

  constructor(iterations: number) {
    this.iterations = iterations
  }

  toJSON(): PbkdfPreferencesJSON {
    return {
      iterations: this.iterations,
    }
  }

  static fromObject(value: PbkdfPreferencesJSON): PbkdfPreferences {
    return new PbkdfPreferences(value.iterations)
  }

  static default(): PbkdfPreferences {
    return new PbkdfPreferences(100_000)
  }
}
