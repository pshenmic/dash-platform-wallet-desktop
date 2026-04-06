import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { SunIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
import { useRipple } from '@renderer/hooks/useRipple'
import { API } from '@renderer/api'
import { useAuth } from '@renderer/contexts/AuthContext'
import { toDropdownOptions } from '@renderer/utils/wallets'
import { WalletDto } from '@renderer/api/types'
import DeleteWallet from './modal/DeleteWallet'
import DropdownSelect from './ui/DropdownSelect'
import { StatusDot } from './ui/ConnectionSelect'
import { Text } from './dash-ui-kit-enxtended'
import { useTheme } from 'dash-ui-kit/react'

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
  const hoverNotification = useRipple()
  const { status, switchWallet, goToCreateWallet } = useAuth()
  const [wallets, setWallets] = useState<WalletDto[]>([])
  const { toggleTheme } = useTheme()
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
          <button
            type={"button"}
            className={`
              relative
              overflow-hidden
              flex items-center gap-3 px-4 h-12
              rounded-[.9375rem]
              dash-block-3
              pr-6!
              dash-black-border
              cursor-pointer
              focus:outline-none
            `}
          >
            <StatusDot active={true} />
            <div className={"flex flex-col items-start gap-[.125rem]"}>
              <Text size={14} weight={"medium"} color={"brand"}>
                Connection
              </Text>
              <Text size={10} weight={"medium"} color={"brand"} opacity={50}>
                Dash Insight API
              </Text>
            </div>
          </button>
          <button
            onMouseEnter={hoverNotification.onMouseEnter}
            onMouseMove={hoverNotification.onMouseMove}
            onMouseLeave={hoverNotification.onMouseLeave}
            className={headerButtonClass}
            onClick={toggleTheme}
          >
            <SunIcon size={26} className="dash-text-default" />
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
