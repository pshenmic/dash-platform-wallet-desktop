import { ReactNode, useState } from 'react';
import { Button } from '@renderer/components/dash-ui-kit-enxtended';
import { PlusIcon, WebIcon, WalletIcon, NotificationIcon } from '@renderer/components/dash-ui-kit-enxtended/icons';
import { Text } from '@renderer/components/dash-ui-kit-enxtended';
import { SelectOption } from 'dash-ui-kit/react';
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
        className={"text-dash-primary-dark-blue dark:text-white"}
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
        className={"text-dash-primary-dark-blue dark:text-white"}
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

  return (
    <div className={"relative w-full h-screen flex flex-col overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
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
          className={`
            size-12
            flex
            items-center
            justify-center
            cursor-pointer
            transition-[bg,scale,translate]
            duration-300
            ease
            rounded-[.9375rem]
            bg-dash-primary-dark-blue/3 dark:bg-white/4
            dark:border dark:border-white/12
            hover:bg-dash-brand/20 dark:hover:bg-dash-mint/15
            hover:scale-102
            hover:shadow-md
            hover:-translate-y-0.5
            group
        `}>
          <NotificationIcon
            size={17}
            className={`
            text-dash-primary-dark-blue
            group-hover:text-dash-brand
            dark:text-white
            group-hover:dark:text-dash-mint
            `}/>
        </button>
      </header>

      <main className={"flex-1 mt-12"}>
        {!hasWallet ? (
          <div className={"flex flex-col items-center justify-center h-full"}>
            <div className={"w-46.5 h-47"}>
              <img src={noAccountsImage} alt={"Empty State"} className={"w-full h-full object-contain"} />
            </div>

            <Text as={"h2"} size={36} weight={"medium"} color={"brand"} className={"text-center mb-4 mt-8"}>
              You <span className={"text-dash-brand dark:text-dash-mint font-extrabold"}>Don't Have any <br/>Identities</span> imported yet
            </Text>

            <Button
              variant={"outline"}
              colorScheme={"brand-mint"}
              size={"xl"}
              className={`
                gap-[.9375rem]
                w-97.5
                rounded-[.75rem]
                hover:shadow-md
                hover:scale-102
                hover:-translate-y-0.5
                !transition-[shadow,scale,translate,background]
                duration-300 ease-out
              `}
              onClick={onAddWallet}
            >
              <PlusIcon size={16} color={"inherit"}/>
              <Text color={"brand-mint"} weight={"medium"} size={14}>Add an identity</Text>
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
