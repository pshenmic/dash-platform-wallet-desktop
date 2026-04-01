import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { NotificationIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
import { useRipple } from '@renderer/hooks/useRipple'
import DropdownSelect from './ui/DropdownSelect'
import ConnectionSelect from './ui/ConnectionSelect'
import { API } from '@renderer/api'
import { useAuth } from '@renderer/contexts/AuthContext'
import { toDropdownOptions, WalletDto } from '@renderer/utils/wallets'
import DeleteWallet from './modal/DeleteWallet'

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
  const [selectedWallet, setSelectedWallet] = useState('')
  const [connection, setConnection] = useState('api')
  const hoverNotification = useRipple()
  const { status, switchWallet, goToCreateWallet } = useAuth()
  const [wallets, setWallets] = useState<WalletDto[]>([])

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null)

  const openDeleteModal = (walletId: string) => {
    setWalletToDelete(walletId)
    setIsDeleteOpen(true)
  }

  useEffect(() => {
    API.getAllWallets()
      .then((data) => {
        const list = (data ?? []) as WalletDto[]
        setWallets(list)
      })
      .catch((e) => console.error(e))
  }, [])

  useEffect(() => {
    API.getStatus().then((result) => {
      console.log('result', result)
    })
  }, [])

 useEffect(() => {
  if (status?.selectedWalletId) {
    setSelectedWallet(status.selectedWalletId)
  } else if (wallets.length > 0 && !selectedWallet) {
    setSelectedWallet(wallets[0].walletId)
  }
}, [status?.selectedWalletId, wallets, selectedWallet])

const walletOptions = useMemo(() => toDropdownOptions(wallets), [wallets])

  const handleWalletChange = (walletId: string): void => {
    if (!walletId || walletId === selectedWallet) return
    setSelectedWallet(walletId)
    switchWallet(walletId)
  }

  return (
    <div id={"layout-root"} className={"relative w-full h-screen flex flex-col overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
      <header className={"flex items-center justify-between mt-12 px-12"}>
        <DropdownSelect
          options={walletOptions}
          value={selectedWallet}
          onChange={handleWalletChange}
          onItemAction={openDeleteModal}
          onAdd={goToCreateWallet}
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

      <DeleteWallet
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        walletToDelete={walletToDelete}
        setWalletToDelete={setWalletToDelete}
        setWallets={setWallets}
        selectedWallet={selectedWallet}
      />
    </div>
  )
}
