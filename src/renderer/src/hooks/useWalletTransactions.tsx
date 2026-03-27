import { useEffect, useState } from 'react'
import { API } from '@renderer/api'

type InsightTx = {
  txid: string
  vin: { addr?: string; value: number }[]
  vout: { value: string; scriptPubKey?: { addresses?: string[] } }[]
  confirmations: number
  time: number
  blockTime: number
}

export function useWalletTransactions(walletId = '43997f03') {
  const [txs, setTxs] = useState<InsightTx[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!walletId) {
      setTxs([])
      return
    }
    let dead = false
    setLoading(true)
    setErr(null)
    API.getTransactions(walletId)
      .then((raw) => {
        console.log('raw', raw)
        if (!dead) setTxs(raw as InsightTx[])
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

  return { txs, loading, err }
}
