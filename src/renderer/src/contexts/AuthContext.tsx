import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { API } from '@renderer/api'
import { useNavigate } from 'react-router-dom'
import { AppStatus } from '@renderer/api/types'

interface AuthContextValue {
  bootstrapped: boolean
  status: AppStatus | null
  isAuthenticated: boolean
  preselectedWalletId: string | null
  refreshStatus: () => Promise<void>
  loginSuccess: () => Promise<void>
  setPreselectedWalletId: (walletId: string | null) => void
  switchWallet: (walletId: string) => void
  goToCreateWallet: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [bootstrapped, setBootstrapped] = useState(false)
  const [status, setStatus] = useState<AppStatus | null>(null)
  const [preselectedWalletId, setPreselectedWalletId] = useState<string | null>(null)
  const navigate = useNavigate()

  const refreshStatus = useCallback(async () => {
    const next = await API.getStatus() as AppStatus
    setStatus(next)
  }, [])

  useEffect(() => {
    refreshStatus()
      .catch(() => setStatus(null))
      .finally(() => setBootstrapped(true))
  }, [refreshStatus])

  const loginSuccess = useCallback(async () => {
    await refreshStatus()
    setPreselectedWalletId(null)
  }, [refreshStatus])

  const switchWallet = useCallback((walletId: string) => {
    if (!walletId) return
    setPreselectedWalletId(walletId)
    setStatus(null)
    navigate('/')
  }, [navigate])

  const goToCreateWallet = useCallback(() => {
    setPreselectedWalletId(null)
    setStatus(null)
    navigate('/create-wallet')
  }, [navigate])

  const isAuthenticated = Boolean(status?.ready && status?.selectedWalletId)

  const value = useMemo<AuthContextValue>(() => ({
    bootstrapped,
    status,
    isAuthenticated,
    preselectedWalletId,
    refreshStatus,
    loginSuccess,
    setPreselectedWalletId,
    switchWallet,
    goToCreateWallet
  }), [bootstrapped, status, isAuthenticated, preselectedWalletId, refreshStatus, loginSuccess, switchWallet, goToCreateWallet])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
