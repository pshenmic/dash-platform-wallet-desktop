import { useState, useCallback } from 'react'

export type CreateWalletStep = 'password' | 'seed-phrase' | 'verify' | 'success'
export type WordCount = 12 | 24

export interface TypeUseCreateWallet {
  step: CreateWalletStep
  password: string
  seedPhrase: string[]
  verifyPhrase: string[]
  wordCount: WordCount

  setPassword: (password: string) => void
  setWordCount: (count: WordCount) => void
  generateSeedPhrase: () => void
  verifyMissingWords: (words: string[]) => void
  verifySeedPhrase: () => void
  goBack: () => void
}

const MOCK_SEED_PHRASE_12 = [
  'door', 'park', 'husband', 'picnic', 'prosper', 'reflect',
  'visit', 'praise', 'isolate', 'already', 'snake', 'supreme'
]

const MOCK_SEED_PHRASE_24 = [
  'door', 'park', 'husband', 'picnic', 'prosper', 'reflect',
  'visit', 'praise', 'isolate', 'already', 'snake', 'supreme',
  'door', 'park', 'husband', 'picnic', 'prosper', 'reflect',
  'visit', 'praise', 'isolate', 'already', 'snake', 'supreme'
]

export function useCreateWallet(): TypeUseCreateWallet {
  const [step, setStep] = useState<CreateWalletStep>('password')
  const [password, setPasswordState] = useState('')
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])
  const [verifyPhrase, setVerifyPhrase] = useState<string[]>([])
  const [wordCount, setWordCountState] = useState<WordCount>(12)

  const setPassword = useCallback((newPassword: string) => {
    setPasswordState(newPassword)
  }, [])

  const setWordCount = useCallback((count: WordCount) => {
    setWordCountState(count)
    setSeedPhrase(count === 12 ? MOCK_SEED_PHRASE_12 : MOCK_SEED_PHRASE_24)
  }, [])

  const generateSeedPhrase = useCallback(() => {
    setSeedPhrase(wordCount === 12 ? MOCK_SEED_PHRASE_12 : MOCK_SEED_PHRASE_24)
    setStep('seed-phrase')
  }, [wordCount])

  const getVerifyPhrase = useCallback(() => {
    const phraseWithBlanks = seedPhrase.map((word, index) => {
      return (index + 1) % 5 === 0 ? '' : word
    })

    setVerifyPhrase(phraseWithBlanks)
  }, [seedPhrase])

  const verifyMissingWords = useCallback((words: string[]) => {
    console.log('words', words)
    setStep('success')
  }, [])

  const verifySeedPhrase = useCallback(() => {
    getVerifyPhrase()
    setStep('verify')
  }, [getVerifyPhrase])

  const goBack = useCallback(() => {
    setStep(prev => {
      if (prev === 'verify') {
        setVerifyPhrase([])
        return 'seed-phrase'
      }

      if (prev === 'seed-phrase') {
        setSeedPhrase([])
        setPassword('')
        return 'password'
      }

      return prev
    })
  }, [])

  return {
    step,
    password,
    seedPhrase,
    verifyPhrase,
    wordCount,
    setPassword,
    setWordCount,
    generateSeedPhrase,
    verifyMissingWords,
    verifySeedPhrase,
    goBack
  }
}
