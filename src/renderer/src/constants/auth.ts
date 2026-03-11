export interface BaseTexts {
  title: string
  description: string
}

export interface CreateWalletTexts extends BaseTexts {
  labelPassword: string
  labelConfirmPassword: string
  placeholderPassword: string
  placeholderConfirmPassword: string
  buttonNext: string
  importWallet: string
}

export interface SaveYourSeedPhraseTexts extends BaseTexts {
  buttonContinue: string
  buttonCopy: string
}

export interface FillInYourSeedPhraseTexts extends BaseTexts{
  buttonContinue: string
}

export interface SuccessTexts extends BaseTexts {
  subtitle: string
  buttonContinue: string
}

export interface AuthTexts {
  createWallet: CreateWalletTexts
  saveYourSeedPhrase: SaveYourSeedPhraseTexts
  fillInYourSeedPhrase: FillInYourSeedPhraseTexts
  seedPhraseWarning: BaseTexts
  success: SuccessTexts
}

export const authTexts: AuthTexts = {
  createWallet: {
    title: 'Create Wallet',
    description: 'You will use this password to unlock your wallet. Do not share your password with others',
    labelPassword: 'Password',
    labelConfirmPassword: 'Confirm Password',
    placeholderPassword: 'Type Your Password',
    placeholderConfirmPassword: 'Repeat your Password',
    buttonNext: 'Next',
    importWallet: 'Import wallet instead'
  },
  saveYourSeedPhrase: {
    title: 'Save your Seed Phrase',
    description: 'This recovery phrase is your wallet\'s only backup. If you lose it, no one can help you access your funds. Your recovery phrase is safest when written on paper and stored in a secure place.',
    buttonContinue: 'Continue',
    buttonCopy: 'Copy'
  },
  fillInYourSeedPhrase: {
    title: 'Fill in your Seed Phrase',
    description: 'This recovery phrase is your wallet\'s only backup. If you lose it, no one can help you access your funds. Your recovery phrase is safest when written on paper and stored in a secure place.',
    buttonContinue: 'Continue'
  },
  seedPhraseWarning: {
    title: 'DO NOT share your recovery phrase with ANYONE.',
    description: 'Anyone with your recovery phrase can have full control over your assets. Please stay vigilant against phishing attacks at all times.'
  },
  success: {
    title: 'Your Wallet Was',
    subtitle: 'Succesfully Created',
    description: 'Enjoy the best Dash Platform experience in browser!',
    buttonContinue: 'Continue'
  }
}
