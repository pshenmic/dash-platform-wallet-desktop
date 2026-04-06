import { useState, useCallback, useEffect } from 'react'
import { API } from '@renderer/api'
import { WalletDto } from '@renderer/api/types'

export interface UseLoginReturn {
  wallets: WalletDto[]
  isLoading: boolean
  selectedWalletId: string | null
  setSelectedWalletId: (id: string) => void
  password: string
  setPassword: (pw: string) => void
  hasError: boolean
  login: () => Promise<boolean>
}

export function useLogin(): UseLoginReturn {
  const [wallets, setWallets] = useState<WalletDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [password, setPasswordState] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!selectedWalletId) return
    API.selectWallet(selectedWalletId)
  }, [selectedWalletId])

  useEffect(() => {
    setIsLoading(true)
    API.getAllWallets()
      .then((result) => {
        const raw = result as WalletDto[]
        if (!Array.isArray(raw) || raw.length === 0) return
        setWallets(raw)

        const defaultWallet = raw.find((w) => w.selected)
        setSelectedWalletId(defaultWallet?.walletId ?? raw[0].walletId)
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
