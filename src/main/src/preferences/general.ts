export interface GeneralPreferencesJSON {
  language: string
  currency: string
}

export class GeneralPreferences {
  language: string
  currency: string

  constructor(language: string, currency: string) {
    this.language = language
    this.currency = currency
  }

  toJSON(): GeneralPreferencesJSON {
    return {
      language: this.language,
      currency: this.currency,
    }
  }

  static fromObject({language, currency}: GeneralPreferencesJSON): GeneralPreferences {
    return new GeneralPreferences(language, currency)
  }

  static default(): GeneralPreferences {
    return new GeneralPreferences('en', 'USD')
  }
}
