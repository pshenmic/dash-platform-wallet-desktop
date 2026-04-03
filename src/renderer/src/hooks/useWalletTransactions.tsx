import { useEffect, useState } from 'react'
import { API } from '@renderer/api'
import { formatCreationDate } from '@renderer/utils/date'

export type WalletTxDto = {
  walletId: string
  txid: string
  address: string
  direction: 1 | -1
  inAmount: bigint
  blockHeight: number | undefined
  size: number
  outAmount: bigint
  transferAmount: bigint
  usdAmount: string
  date: string | Date
  confirmations: number
  status: string
  vin: Array<{ addr?: string; value?: number; valueSat?: number }>
  vout: Array<{ value: string; address?: string }>
}

type UiStatus = 'success' | 'failed' | 'pending'

export type WalletTxItem = {
  id: string
  status: UiStatus
  confirmations: number
  blockHeight: number | undefined
  size: number
  kind?: 'core'
  title: 'Send' | 'Receive'
  subtitleLabel: 'from' | 'to'
  labelValue: string
  amount: bigint
  usdAmount: string
  date: Date
  direction: 'in' | 'out'
  vin: Array<{ addr?: string; value?: number; valueSat?: number }>
  vout: Array<{ value: string; address?: string }>
}

type TransactionGroup = {
  date: string
  transactions: WalletTxItem[]
}

function groupTransactionsByDay(items: WalletTxItem[]) {
  const map = new Map<string, WalletTxItem[]>()
  for (const tx of items) {
    const key = formatCreationDate(tx.date)
    const arr = map.get(key) ?? []
    arr.push(tx)
    map.set(key, arr)
  }
  return Array.from(map.entries()).map(([label, transactions]) => ({
    date: label,
    transactions
  }))
}

function mapStatus(status: string, confirmations: number): UiStatus {
  if (status === 'Failed' || status === 'Error') return 'failed'
  if (confirmations >= 6) return 'success'
  return 'pending'
}

function mapTx(raw: WalletTxDto): WalletTxItem {
  const direction: 'in' | 'out' = raw.direction === 1 ? 'in' : 'out'
  const rawConfirmations = raw.confirmations
  return {
    id: raw.txid,
    status: mapStatus(raw.status, rawConfirmations),
    confirmations: rawConfirmations,
    kind: 'core',
    blockHeight: raw.blockHeight,
    size: raw.size,
    title: direction === 'in' ? 'Receive' : 'Send',
    subtitleLabel: direction === 'in' ? 'from' : 'to',
    labelValue: raw.address,
    amount: raw.transferAmount,
    usdAmount: raw.usdAmount,
    date: new Date(raw.date),
    direction,
    vin: raw.vin,
    vout: raw.vout,
  }
}

export function useWalletTransactions(walletId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [groups, setGroups] = useState<TransactionGroup[]>([])

  useEffect(() => {
    if (!walletId) {
      setGroups([])
      setErr(null)
      setLoading(false)
      return
    }

    let dead = false
    setLoading(true)
    setErr(null)

    API.getTransactions(walletId)
      .then((raw) => {
        if(dead) return
        const items = ((raw ?? []) as WalletTxDto[]).map(mapTx)
        const groups = groupTransactionsByDay(items)
        setGroups(groups)
      })
      .catch((e) => {
        console.error('error', e)
        if (!dead) setErr(e instanceof Error ? e.message : 'Failed')
      })
      .finally(() => {
        if (!dead) setLoading(false)
      })
    return () => {
      dead = true
    }
  }, [walletId])

  return { groups, loading, err }
}
