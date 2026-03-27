import { useState, useCallback, useEffect } from 'react'
import { API } from '@renderer/api'

export interface LoginWallet {
  walletId: string
  name: string
  network: string
  isDefault?: boolean
}

export interface UseLoginReturn {
  wallets: LoginWallet[]
  isLoading: boolean
  selectedWalletId: string | null
  setSelectedWalletId: (id: string) => void
  password: string
  setPassword: (pw: string) => void
  hasError: boolean
  login: () => Promise<boolean>
}

export function useLogin(): UseLoginReturn {
  const [wallets, setWallets] = useState<LoginWallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [password, setPasswordState] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!selectedWalletId) return
    API.selectWallet(selectedWalletId)
      .then((result) => {
        console.log('result', result)
      })
      .catch(() => {
      })
  }, [selectedWalletId])

  useEffect(() => {
    setIsLoading(true)
    API.getAllWallets()
      .then((result) => {
        console.log('result', result)
        const raw = result as Array<{
          walletId: string
          network: string
          selected: boolean
        }>
        if (!Array.isArray(raw) || raw.length === 0) return

        const mapped: LoginWallet[] = raw.map((w, index) => ({
          walletId: w.walletId,
          name: `Wallet_${index + 1}`,
          network: w.network,
          isDefault: w.selected,
        }))
        setWallets(mapped)

        const defaultWallet = mapped.find((w) => w.isDefault)
        setSelectedWalletId(defaultWallet?.walletId ?? mapped[0].walletId)
      })
      .catch(() => {
      })
      .finally(() => setIsLoading(false))
  }, [])

  const setPassword = useCallback((pw: string) => {
    setPasswordState(pw)
    setHasError(false)
  }, [])

  const login = useCallback(async (): Promise<boolean> => {
    if (!selectedWalletId || !password) {
      setHasError(true)
      return false
    }

    const MOCK_PASSWORD = '1234'
    const isValid = password === MOCK_PASSWORD

    if (!isValid) {
      setHasError(true)
      return false
    }

    return true
  }, [selectedWalletId, password])

  return {
    wallets,
    isLoading,
    selectedWalletId,
    setSelectedWalletId,
    password,
    setPassword,
    hasError,
    login
  }
}
