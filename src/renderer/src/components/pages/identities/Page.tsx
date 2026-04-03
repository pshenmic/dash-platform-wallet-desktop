import { Input } from "@renderer/components/dash-ui-kit-enxtended";
import { SearchIcon, Tabs } from "dash-ui-kit/react";
import { useState } from "react";
import IdentityCard from "./IdentityCard";
import NoResults from "@renderer/components/ui/NoResults";
import { useIdentities } from "@renderer/hooks/useIdentities";
import { useAuth } from "@renderer/contexts/AuthContext";
import ListSkeleton from "@renderer/components/ui/Skeleton";

export interface Identity {
  walletAddress: string
  name: string
  // creationDate: string
  balance: {
    total: bigint
    approx: string
    currency: string
  }
}

function filterIdentities(identities: Identity[], query: string): Identity[] {
  const q = query.trim().toLowerCase()
  if (!q) return identities
  return identities.filter((identity) =>
    // identity.names.toLowerCase().includes(q) ||
    identity.walletAddress.toLowerCase().includes(q)
  )
}

export default function Identities(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const { status } = useAuth()
  // const filteredIdentities = filterIdentities(identitiesList, searchQuery)
  const { identities, loading, err } = useIdentities(status?.selectedWalletId ?? undefined)

  const mappedIdentities: Identity[] = identities.map((item) => ({
    walletAddress: item.identifier,
    name: item.alias ?? '',
    balance: {
      total: item.balance.amount,
      approx: item.balance.usdAmount,
      currency: 'Credits',
    },
  }))

  const filteredIdentities = filterIdentities(mappedIdentities, searchQuery)

  const assetsList = [
    {
      value: 'your-identities',
      label: 'Your Identities',
      content: (
        <div className={"flex flex-col gap-5"}>
          {/* TODO: Add Search Input */}
          {/* <div className={"mt-[.5rem] grid grid-cols-[1fr_auto] items-stretch w-full"}>
            <Input
              placeholder={'Search identity'}
              value={searchQuery}
              variant={"filled"}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={'rounded-[.75rem] wallet-input'}
              colorScheme={"light"}
              prefix={<SearchIcon size={16} className={"dash-text-default"} />}
              prefixClassName={"absolute top-1/2 left-4"}
              autoFocus
            />
          </div> */}
          <div className={"flex flex-col gap-[.625rem] w-full"}>
            {loading && <ListSkeleton rows={5} />}
            {!loading && err && (
              <NoResults noResults={"Failed to load identities"} />
            )}
            {!loading && !err && filteredIdentities.length === 0 && (
              <NoResults noResults={"No identities found"} />
            )}
            {!loading && !err && filteredIdentities.map((identity) => (
              <IdentityCard key={identity.walletAddress} identity={identity} />
            ))}
          </div>
        </div>
      )
    }
  ]

  return (
    <div className={"w-full px-12 pb-12 "}>
      <div className={"shadow-[8px_0_64px_0_rgba(12,28,51,0.08)] dash-card-base rounded-3xl p-[.9375rem]"}>
        <Tabs
          items={assetsList}
          value={'your-identities'}
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
