export interface Messages {
  createWallet: {
    invalidPhrase: string
    phraseDoesNotMatch: string
    couldNotCreateWallet: string
    passwordValidation: {
      minLength: string
      maxLength: string
      letterRequired: string
      numberRequired: string
      specialCharRequired: string
      passwordsDoNotMatch: string
    }
    seedPhrase: {
      warning: string
      errorMessage: string
      errorTitle: string
    }
  }
  login: {
    invalidPassword: string
  }
}

export const messages: Messages = {
  createWallet: {
    invalidPhrase: "**Invalid phrase** Word count does not match your recovery phrase.",
    phraseDoesNotMatch: "**Recovery phrase does not match** Check the words you entered and try again.",
    couldNotCreateWallet: "**Could not create wallet**",

    passwordValidation: {
      minLength: '**Check your password** Use at least 12 characters.',
      maxLength: '**Check your password** Password must be at most 128 characters.',
      letterRequired: '**Check your password** Include at least one letter.',
      numberRequired: '**Check your password** Include at least one number.',
      specialCharRequired: '**Check your password** Include at least one special character (!@#…).',
      passwordsDoNotMatch: '**Check your password** Passwords do not match.',
    },

    seedPhrase: {
      warning: '**DO NOT share your recovery phrase with ANYONE.** Anyone with your recovery phrase can have full control over your assets. Please stay vigilant against phishing attacks at all times.',
      errorMessage: 'Unexpected error while generating seed phrase.',
      errorTitle: '**Something went wrong**',
    },
  },
  login: {
    invalidPassword: "**Invalid password** please try again.",
  }
}
