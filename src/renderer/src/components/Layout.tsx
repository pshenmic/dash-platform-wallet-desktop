import React, { ReactNode, useEffect, useState } from 'react'
import { NotificationIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
import { useRipple } from '@renderer/hooks/useRipple'
import DropdownSelect from './ui/DropdownSelect'
import ConnectionSelect from './ui/ConnectionSelect'
import { API } from '@renderer/api'

interface LayoutProps {
  children: ReactNode
}

const headerButtonClass = `
  size-12
  overflow-hidden
  relative
  flex
  items-center
  justify-center
  cursor-pointer
  rounded-[.9375rem]
  dash-block
  dash-black-border
  group
`

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [selectedWallet, setSelectedWallet] = useState('w1')
  const [connection, setConnection] = useState('api')
  const hoverNotification = useRipple()

  useEffect(() => {
    API.getStatus().then((result) => {
      console.log('result', result)
    })
  }, [])

  return (
    <div id={"layout-root"} className={"relative w-full h-screen flex flex-col overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
      <header className={"flex items-center justify-between mt-12 px-12"}>
        <DropdownSelect
          options={[
            { value: 'w1', label: 'Wallet_1', description: 'Default' },
            { value: 'w2', label: 'Wallet_2', description: 'Default' },
          ]}
          value={selectedWallet}
          onChange={setSelectedWallet}
          onItemAction={(val) => console.log('action on', val)}
          onAdd={() => console.log('add wallet')}
          addLabel={"Add wallet"}
        />

        <div className={"flex items-center gap-[.625rem]"}>
          <ConnectionSelect
            options={[
              { value: 'api', label: 'Connection', description: 'dashscan.io' },
              { value: 'p2p', label: 'P2P', description: 'P2P Connection' },
            ]}
            value={connection}
            onChange={setConnection}
          />
          <button
            onMouseEnter={hoverNotification.onMouseEnter}
            onMouseMove={hoverNotification.onMouseMove}
            onMouseLeave={hoverNotification.onMouseLeave}
            className={headerButtonClass}
          >
            <NotificationIcon size={17} className="dash-text-default" />
          </button>
        </div>
      </header>

      <main className={"flex-1 mt-12"}>
        {children}
      </main>
    </div>
  )
}
