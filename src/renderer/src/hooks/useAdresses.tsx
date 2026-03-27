import { useEffect, useState } from 'react'
import { API } from '@renderer/api'

export type WalletAddressDto = {
  walletId: string
  accountId: number
  address: string
  derivationPath: string
  index: number
  isChange: number
  balance: string | null
  label: string | null
  usdBalance: string | null
}
export type GetAddressesResponse = {
  receiving: WalletAddressDto[]
  change: WalletAddressDto[]
}

export function useAdresses(walletId = '43997f03') {
  const [receiving, setReceiving] = useState<WalletAddressDto[]>([])
  const [change, setChange] = useState<WalletAddressDto[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!walletId) {
      setReceiving([])
      setChange([])
      return
    }
    let dead = false
    setLoading(true)
    setErr(null)
    API.getAddresses(walletId)
      .then((data) => {
        if (dead) return
        const body = data as GetAddressesResponse
        setReceiving(body.receiving ?? [])
        setChange(body.change ?? [])
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

  return { receiving, change, loading, err }
}
