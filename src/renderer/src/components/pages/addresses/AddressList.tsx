import { useState } from 'react'
import { Tabs } from 'dash-ui-kit/react'
// import { Button } from '@renderer/components/dash-ui-kit-enxtended'
// import { FilterIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
// import { Text } from '@renderer/components/dash-ui-kit-enxtended'
import { addressesPage } from '@renderer/constants'
import AddressCard from './AddressCard'
import { useAdresses, WalletAddressDto } from '@renderer/hooks/useAdresses'
import { useAuth } from '@renderer/contexts/AuthContext'
import ListSkeleton from '@renderer/components/ui/Skeleton'
import NoResults from '@renderer/components/ui/NoResults'

function AddressTabContent({
  items,
  loading,
  err,
}: {
  items: WalletAddressDto[]
  loading: boolean
  err: string | null
}): React.JSX.Element {
  if (loading) {
    return <ListSkeleton rows={6} rowClassName="h-[2.5rem] rounded-[.875rem]" />
  }

  if (err) {
    return <NoResults noResults={"Failed to load addresses"} />
  }

  if (items.length === 0) {
    return <NoResults noResults={"No addresses found"} />
  }

  return (
    <div className={"flex flex-col gap-[.625rem]"}>
      {items.map((item) => (
        <AddressCard key={item.address} {...item} />
      ))}
    </div>
  )
}

export default function AddressList(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('receiving')
  const { tabs, filter } = addressesPage
  const { status } = useAuth()
  console.log('statusAddressList', status)
  const { receiving, change, loading, err } = useAdresses(status?.selectedWalletId ?? undefined)

  console.log('receiving', receiving)
  console.log('change', change)

  const tabItems = [
    {
      value: 'receiving',
      label: tabs.receiving,
      content: <AddressTabContent items={receiving} loading={loading} err={err}/>,
    },
    {
      value: 'change',
      label: tabs.change,
      content: <AddressTabContent items={change} loading={loading} err={err}/>,
    },
  ]

  return (
    <div className={"px-12 pb-8"}>
      <div className={`
        relative
        flex
        p-[.9375rem]
        rounded-3xl
        dash-card-base
        shadow-[0_0_32px_0_rgba(12,28,51,0.08)]
      `}>
        {/* <Button
          colorScheme={"primary-light"}
          className={`
            absolute
            top-5
            right-[.9375rem]
            flex
            items-center
            gap-[.625rem]
            px-2
            py-1
            z-1
            min-h-fit!
            rounded-[.3125rem]
          `}
        >
          <FilterIcon size={12} color={"currentColor"} className={"dash-text-default"} />
          <Text size={14} weight={"medium"} color={"brand"}>
            {filter}
          </Text>
        </Button> */}

        <Tabs
          items={tabItems}
          value={activeTab}
          onValueChange={setActiveTab}
          size={"xl"}
          triggerClassName={
            'data-[state=active]:text-dash-primary-dark-blue ' +
            'data-[state=inactive]:text-dash-primary-dark-blue/35 ' +
            'dark:data-[state=active]:text-white ' +
            'dark:data-[state=inactive]:text-white/35 ' +
            'font-medium tracking-[-0.03em]'
          }
        />
      </div>
    </div>
  )
}
