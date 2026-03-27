import { Input } from "@renderer/components/dash-ui-kit-enxtended";
import { SearchIcon, Tabs } from "dash-ui-kit/react";
import { useState } from "react";
import IdentityCard from "./IdentityCard";
import NoResults from "@renderer/components/ui/NoResults";
import { useIdentities } from "@renderer/hooks/useIdentities";

export interface Identity {
  walletAddress: string
  names: string
  creationDate: string
  balance: {
    total: string
    approx: string
    currency: string
  }
}

const identitiesList: Identity[] = [
  {
    walletAddress: 'EWSqsaghuwHRjtutbXK3nR11KbRkg9a12PNAAkJWRTp1',
    names: 'pshenmic',
    creationDate: '2026-03-11',
    balance: {
      total: '100',
      approx: '10',
      currency: 'DASH',
    }
  },
  {
    walletAddress: 'EWSqsaghuwHRjtutbXK3nR11KbRkg9a12PNAAkJWRTp2',
    names: 'pshenmic',
    creationDate: '2025-03-12',
    balance: {
      total: '100',
      approx: '10',
      currency: 'CRDT',
    }
  },
  {
    walletAddress: 'EWSqsaghuwHRjtutbXK3nR11KbRkg9a12PNAAkJWRTp3',
    names: 'pshenmic',
    creationDate: '2023-03-12',
    balance: {
      total: '120',
      approx: '10',
      currency: 'CRDT',
    }
  }
]

function filterIdentities(identities: Identity[], query: string): Identity[] {
  const q = query.trim().toLowerCase()
  if (!q) return identities
  return identities.filter((identity) =>
    identity.names.toLowerCase().includes(q) ||
    identity.walletAddress.toLowerCase().includes(q)
  )
}

export default function Identities(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  // const { loading, err } = useIdentities()
  const filteredIdentities = filterIdentities(identitiesList, searchQuery)

  const assetsList = [
    {
      value: 'your-identities',
      label: 'Your Identities',
      content: (
        <div className={"flex flex-col gap-5"}>
          <div className={"mt-[.5rem] grid grid-cols-[1fr_auto] items-stretch gap-[.75rem] w-full"}>
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
          </div>
          <div className={"flex flex-col gap-[.625rem] w-full"}>
            {filteredIdentities.length === 0 && (
              <NoResults noResults={"No identities found"} />
            )}
            {filteredIdentities.map((identity) => (
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
