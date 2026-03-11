import { useState, useEffect } from 'react'
import { AssetSelectorPersistKey } from './useAssetSelector'
import { DollarIcon, EuroIcon, IconProps } from '@renderer/components/dash-ui-kit-enxtended/icons'

export interface Currency {
  id: string
  icon: React.FC<IconProps>
}

const MOCK_CURRENCIES: Currency[] = [
  { id: 'usd', icon: DollarIcon },
  { id: 'eur', icon: EuroIcon },
]

export function useCurrencySelector({ persistKey }: { persistKey: AssetSelectorPersistKey }) {
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>(() => {
    const saved = localStorage.getItem(`currency-${persistKey}`)
    return saved || MOCK_CURRENCIES[0].id
  })

  useEffect(() => {
    localStorage.setItem(`currency-${persistKey}`, selectedCurrencyId)
  }, [persistKey, selectedCurrencyId])

  const selectedCurrency = MOCK_CURRENCIES.find(c => c.id === selectedCurrencyId)

  const selectCurrency = (currencyId: string) => {
    setSelectedCurrencyId(currencyId)
  }

  return {
    selectedCurrency,
    currencies: MOCK_CURRENCIES,
    selectCurrency
  }
}
