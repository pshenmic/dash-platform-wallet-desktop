import { ReactNode, useState } from 'react';
import { Button } from '@renderer/components/dash-ui-kit-enxtended';
import { PlusIcon, WebIcon, WalletIcon, NotificationIcon } from '@renderer/components/dash-ui-kit-enxtended/icons';
import { Text } from '@renderer/components/dash-ui-kit-enxtended';
import { SelectOption } from 'dash-ui-kit/react';
import { useRipple } from '@renderer/hooks/useRipple';
import noAccountsImage from '@renderer/assets/images/noAccounts.png';
import StyledSelect from './dash-ui-kit-enxtended/styled-select';

interface LayoutProps {
  children: ReactNode
  hasWallet?: boolean
  onAddWallet: () => void
}

interface NetworkData {
  value: string
  label: string
}

interface WalletData {
  value: string
  label: string
  type: string
}

const MOCK_WALLETS: WalletData[] = [
  { value: 'wallet1', label: 'Wallet_1', type: 'Key Store' },
  { value: 'wallet2', label: 'Wallet_2', type: 'Key Store' },
  { value: 'wallet3', label: 'Wallet_3', type: 'Hardware' }
]

const MOCK_NETWORKS: NetworkData[] = [
  { value: 'mainnet', label: 'mainnet' },
  { value: 'testnet', label: 'testnet' }
]

const mapNetworkToOption = (network: NetworkData): SelectOption => ({
  value: network.value,
  label: network.label,
  content: (
    <div className={"flex items-center gap-1"}>
      <WebIcon
        size={16}
        color={"currentColor"}
        className={"dash-text-default"}
      />
      <Text size={14} color={"brand"}>{network.label}</Text>
    </div>
  )
})

const mapWalletToOption = (wallet: WalletData): SelectOption => ({
  value: wallet.value,
  label: wallet.label,
  content: (
    <div className={"flex items-center gap-2 group"}>
      <WalletIcon
        size={16}
        color={"currentColor"}
        className={"dash-text-default"}
      />
      <div className={"flex flex-col gap-[.125rem]"}>
        <Text
          size={14}
          color={"brand"}
          weight={"medium"}
          className={"leading-[121%]"}
        >
          {wallet.label}
        </Text>
        <Text
          size={10}
          color={"brand"}
          weight={"medium"}
          opacity={50}
          className={"leading-[120%]"}
        >
          {wallet.type}
        </Text>
      </div>
    </div>
  )
})

export default function Layout({ children, hasWallet = false, onAddWallet }: LayoutProps): React.JSX.Element {
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet')
  const [selectedWallet, setSelectedWallet] = useState('wallet1')

  const networkOptions = MOCK_NETWORKS.map(network => mapNetworkToOption(network))
  const walletOptions = MOCK_WALLETS.map(wallet => mapWalletToOption(wallet))
  const hoverNotification = useRipple()
  const hoverAddButton = useRipple()

  return (
    <div id={"layout-root"} className={"relative w-full h-screen flex flex-col overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
      <header className={"flex items-center justify-between mt-12 px-12"}>
        <div className={"flex items-stretch gap-[.625rem] pointer-events-auto h-12"}>
          <StyledSelect
            options={networkOptions}
            value={selectedNetwork}
            onChange={setSelectedNetwork}
          />
          <StyledSelect
            options={walletOptions}
            value={selectedWallet}
            onChange={setSelectedWallet}
          />
        </div>
        <button
          {...hoverNotification}
          className={`
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
        `}>
          <NotificationIcon
            size={17}
            className={"dash-text-default"}/>
        </button>
      </header>

      <main className={"flex-1 mt-12"}>
        {!hasWallet ? (
          <div className={"flex flex-col items-center justify-center h-full"}>
            <div className={"w-46.5 h-47"}>
              <img src={noAccountsImage} alt={"Empty State"} className={"w-full h-full object-contain"} />
            </div>

            <Text as={"h2"} size={36} weight={"medium"} color={"brand"} className={"text-center mb-4 mt-8"}>
              You <span className={"dash-text-primary font-extrabold"}>Don't Have any <br/>Identities</span> imported yet
            </Text>

            <Button
              variant={"outline"}
              colorScheme={"brand-mint"}
              size={"md"}
              className={`
                gap-[.9375rem]
                w-97.5
                rounded-[.75rem]
                overflow-hidden
                relative
              `}
              {...hoverAddButton}
              onClick={onAddWallet}
            >
              <PlusIcon size={16} color={"inherit"}/>
              <Text color={"blue-mint"} weight={"medium"} size={14}>Add an identity</Text>
            </Button>
          </div>
        ) : (
          <>
            {children}
          </>
        )}
      </main>
    </div>
  )
}
