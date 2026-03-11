import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export interface Asset {
  id: string
  name: string
  symbol: string
  icon?: string
  initials: string
  currency: string
}

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'credits',
    name: 'Credits',
    symbol: 'CRDT',
    initials: 'C',
    currency: 'CRDT',
  },
  {
    id: 'dash',
    name: 'Dash',
    symbol: 'DASH',
    initials: 'D',
    currency: 'DASH',
  },
  {
    id: 'dash-gold',
    name: 'Dash Gold',
    symbol: 'DGLD',
    initials: 'DG',
    currency: 'DGLT',
  },
  {
    id: 'crypto-silver',
    name: 'Crypto Silver',
    symbol: 'CRSL',
    initials: 'CS',
    currency: 'DGLT',
  }
]

export type AssetSelectorPersistKey = 'send' | 'receive'

export function useAssetSelector({persistKey}: {persistKey: AssetSelectorPersistKey}) {
  const location = useLocation()
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    const saved = localStorage.getItem(`asset-${persistKey}`)
    return saved || MOCK_ASSETS[0].id
  })
  const [showModal, setShowModal] = useState(false)

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)

  useEffect(() => {
    localStorage.setItem(`asset-${persistKey}`, selectedAssetId)
  }, [persistKey, selectedAssetId])

  useEffect(() => {
    setShowModal(false)
  }, [location.pathname])

  const selectAsset = (assetId: string) => {
    setSelectedAssetId(assetId)
    closeModal()
  }

  const selectedAsset = MOCK_ASSETS.find(asset => asset.id === selectedAssetId)

  return {
    selectedAsset,
    assets: MOCK_ASSETS,
    showModal,
    openModal,
    closeModal,
    selectAsset,
  }
}
