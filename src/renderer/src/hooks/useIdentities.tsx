import { useEffect, useState } from 'react'
import { API } from '@renderer/api'

export type IdentityApiDto = {
  identityIndex: number
  identifier: string
  alias: string | null
  balance: {
    amount: bigint
    usdAmount: string
  }
  derivationPath: string
}

export function useIdentities(walletId?: string) {
  const [identities, setIdentities] = useState<IdentityApiDto[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!walletId) {
      setIdentities([])
      return
    }

    let dead = false
    setLoading(true)
    setErr(null)

    API.getIdentities(walletId)
      .then((data) => {
        if (dead) return
        setIdentities((data ?? []) as IdentityApiDto[])
      })
      .catch((e) => {
        if (!dead) setErr(e instanceof Error ? e.message : 'Failed to load identities')
      })
      .finally(() => {
        if (!dead) setLoading(false)
      })

    return () => {
      dead = true
    }
  }, [walletId])

  return { identities, loading, err }
}
