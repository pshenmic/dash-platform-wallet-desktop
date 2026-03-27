import { useEffect, useState } from 'react'
import { API } from '@renderer/api'

export function useIdentities(walletId = '43997f03') {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!walletId) {
      return
    }
    let dead = false
    setLoading(true)
    setErr(null)
    API.getIdentities(walletId)
      .then((data) => {
        console.log('data', data)
        if (dead) return
      })
      .catch((e) => {
        console.log('error', e)
        if (!dead) setErr(e instanceof Error ? e.message : 'Failed')
      })
      .finally(() => {
        if (!dead) setLoading(false)
      })
    return () => {
      dead = true
    }
  }, [walletId])

  return { loading, err }
}
