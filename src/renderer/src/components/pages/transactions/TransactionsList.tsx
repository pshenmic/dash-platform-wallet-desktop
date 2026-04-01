import { useState } from 'react'
import { Tabs, DateBlock } from 'dash-ui-kit/react'
import { Button } from '@renderer/components/dash-ui-kit-enxtended'
import { FilterIcon } from '@renderer/components/dash-ui-kit-enxtended/icons'
import { Text } from '@renderer/components/dash-ui-kit-enxtended'
import { transactionsPage } from '@renderer/constants'
import TransactionCard from './TransactionCard'
import { useWalletTransactions, WalletTxItem } from '@renderer/hooks/useWalletTransactions'
import { useAuth } from '@renderer/contexts/AuthContext'
import ListSkeleton from '@renderer/components/ui/Skeleton'
import NoResults from '@renderer/components/ui/NoResults'

// const MOCK_TRANSACTION_GROUPS: TransactionGroup[] = [
//   {
//     date: new Date('2026-03-08'),
//     transactions: [
//       {
//         id: '1',
//         status: 'pending',
//         kind: 'core',
//         title: 'Send',
//         subtitleLabel: 'to',
//         labelValue: 'Xdxs2Wb2z3GUVLbj6aQobnBCKV3JdxLcSZ',
//         amount: 2,
//         usdAmount: 64.53,
//         date: new Date('2026-03-08T01:00:00'),
//         direction: 'in',
//       }
//     ]
//   },
//   {
//     date: new Date('2026-03-06'),
//     transactions: [
//       {
//         id: '2',
//         status: 'success',
//         kind: 'core',
//         title: 'Send',
//         subtitleLabel: 'to',
//         labelValue: 'XcAY5amfZ4qr8WRzppGxL03uGpCFYb19zC',
//         amount: 15,
//         usdAmount: 483.9,
//         date: new Date('2026-03-06T15:24:00'),
//         direction: 'out',
//       },
//       {
//         id: '3',
//         status: 'failed',
//         kind: 'core',
//         title: 'Send',
//         subtitleLabel: 'to',
//         labelValue: 'Xdxs2Wb2z3GUVLbj6aQobnBCKV3JdxLcSZ',
//         amount: 4,
//         usdAmount: 249.04,
//         date: new Date('2026-03-06T12:11:00'),
//         direction: 'out',
//       },
//       {
//         id: '4',
//         status: 'success',
//         kind: 'core',
//         title: 'Receive',
//         subtitleLabel: 'from',
//         labelValue: 'XotUg4YUzzRHNhXC4tvg72d8gun2S96WJJ',
//         amount: 41.2305,
//         usdAmount: 1330.09,
//         date: new Date('2026-03-06T12:07:00'),
//         direction: 'in',
//       }
//     ]
//   },
//   {
//     date: new Date('2026-03-04'),
//     transactions: [
//       {
//         id: '5',
//         status: 'success',
//         kind: 'platform',
//         title: 'Identity Top Up',
//         subtitleLabel: 'hash',
//         labelValue: '13804e67769803ec0e0b11b2426a38946fb755ec9c581783f7f3adb8bffdf3',
//         amount: 7900463,
//         usdAmount: 0.001,
//         date: new Date('2026-03-04T21:57:00'),
//         direction: 'out',
//       },
//       {
//         id: '6',
//         status: 'success',
//         kind: 'platform',
//         title: 'Masternode Vote',
//         subtitleLabel: 'towards identity',
//         labelValue: '62wymIzpsfkk1w9dmrjxcdgy4hagto1l45gfftenvjmx',
//         amount: 10000000,
//         usdAmount: 0.002,
//         date: new Date('2026-03-04T21:12:00'),
//         direction: 'out',
//       }
//     ]
//   }
// ]

interface TransactionsListProps {
  onTransactionClick?: (transaction: WalletTxItem) => void
}

export default function TransactionsList({ onTransactionClick }: TransactionsListProps = {}): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('transactions')
  const {
    transactions: { title, filter }
  } = transactionsPage
  const { status } = useAuth()

  const { groups, loading, err } = useWalletTransactions(status?.selectedWalletId ?? undefined)

  console.log('txs', groups)

  const tabs = [
    {
      value: 'transactions',
      label: title,
      content: (
        <div className={"flex flex-col gap-5 mt-5"}>
           {loading && (
            <ListSkeleton rows={3} rowClassName="h-[4.25rem] rounded-[.875rem]" />
          )}

          {!loading && err && (
            <NoResults noResults={"Failed to load transactions"} />
          )}

          {!loading && !err && groups.length === 0 && (
            <NoResults noResults={"No transactions found"} />
          )}

          {!loading && !err && groups.map((group, groupIndex) => (
            <div key={groupIndex} className={"flex flex-col gap-[.9375rem]"}>
              <DateBlock timestamp={group.date} format={"dateOnly"}/>
                {group.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => { transaction.status === 'pending' || transaction.status === 'failed' ? null : onTransactionClick?.(transaction)}}
                    className={transaction.status === 'pending' || transaction.status === 'failed' ? '' : 'cursor-pointer'}
                  >
                    <TransactionCard {...transaction} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <div className={"px-12 pb-8"}>
      <div className={`
          relative
          flex
          flex-col
          gap-6
          p-[.9375rem]
          rounded-3xl
          dash-card-base
          shadow-[0_0_32px_0_rgba(12,28,51,0.08)]
        `}
      >
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
          items={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          size={"xl"}
          triggerClassName={"!text-dash-primary-dark-blue dark:!text-white font-medium tracking-[-0.03em]"}
        />
      </div>
    </div>
  )
}
