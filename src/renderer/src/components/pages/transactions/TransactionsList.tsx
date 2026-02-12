import { useState } from 'react';
import { Tabs, DateBlock } from 'dash-ui-kit/react';
import { Button } from '@renderer/components/dash-ui-kit-enxtended';
import { FilterIcon, CheckIcon } from '@renderer/components/dash-ui-kit-enxtended/icons';
import { Text } from '@renderer/components/dash-ui-kit-enxtended';
import { transactionsPage } from '@renderer/constants';

interface Transaction {
  id: string
  type: 'receive' | 'send' | 'documentsBatch'
  detailValue: string
  amount: number
  usdAmount: number
  date: number | Date | string
}

interface TransactionGroup {
  date: number | Date | string
  transactions: Transaction[]
}

const MOCK_TRANSACTION_GROUPS: TransactionGroup[] = [
  {
    date: new Date('2025-06-20'),
    transactions: [
      {
        id: '1',
        type: 'receive',
        detailValue: '12345..87sj',
        amount: 204278360,
        usdAmount: 0.04,
        date: new Date('2025-06-20')
      }
    ]
  },
  {
    date: new Date('2025-06-14'),
    transactions: [
      {
        id: '2',
        type: 'send',
        detailValue: '12345..87sj',
        amount: -101236520,
        usdAmount: 0.02,
        date: new Date('2025-06-14')
      },
      {
        id: '3',
        type: 'documentsBatch',
        detailValue: '12345..87SJ1',
        amount: 40371460,
        usdAmount: 0.008,
        date: new Date('2025-06-14')
      }
    ]
  },
  {
    date: new Date('2025-06-11'),
    transactions: [
      {
        id: '4',
        type: 'send',
        detailValue: '12345..87sj',
        amount: -101236520,
        usdAmount: 0.02,
        date: new Date('2025-06-11')
      }
    ]
  },
  {
    date: new Date('2025-06-10'),
    transactions: [
      {
        id: '2',
        type: 'send',
        detailValue: '12345..87sj',
        amount: -101236520,
        usdAmount: 0.02,
        date: new Date('2025-06-14')
      },
      {
        id: '3',
        type: 'documentsBatch',
        detailValue: '12345..87SJ1',
        amount: 40371460,
        usdAmount: 0.008,
        date: new Date('2025-06-14')
      }
    ]
  },
]

export default function TransactionsList(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('transactions')
  const { transactions: { title, filter, types } } = transactionsPage

  const getTransactionDetails = (type: Transaction['type']) => {
    const label = type === 'receive' ? types.receive : type === 'send' ? types.send : types.documentsBatch
    return label
  }

  const tabs = [
    {
      value: 'transactions',
      label: title,
      content: (
        <div className={"flex flex-col gap-5 mt-5"}>
          {MOCK_TRANSACTION_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className={"flex flex-col gap-[.9375rem]"}>
              <DateBlock
                timestamp={group.date}
                format={"dateOnly"}
              />
              {group.transactions.map((transaction) => {
                return (
                  <div
                    key={transaction.id}
                    className={`
                      flex
                      items-center
                      gap-[.9375rem]
                      px-[.9375rem]
                      py-[.625rem]
                      rounded-[.875rem]
                      dash-block
                      dash-black-border
                    `}
                  >
                    <CheckIcon
                      size={24}
                      color={"currentColor"}
                      className={`
                        shrink-0
                        dash-text-default
                        [&_circle]:fill-dash-primary-dark-blue/5
                        dark:[&_circle]:fill-white/4
                      `}
                    />

                    <div className={"flex-1 flex flex-col gap-1"}>
                      <Text size={14} weight={"medium"} color={"brand"} className={"leading-[120%]"}>
                        {getTransactionDetails(transaction.type).title}
                      </Text>
                      <Text size={10} weight={"light"} color={"brand"}>
                        <span className={"opacity-35"}>{getTransactionDetails(transaction.type).detailLabel}</span> {transaction.detailValue}
                      </Text>
                    </div>

                    <div className={"shrink-0 flex flex-col items-end gap-1"}>
                      <Text
                        size={14}
                        weight={"extrabold"}
                        className={transaction.type === 'receive' ? '!text-dash-brand' : '!text-dash-primary-dark-blue dark:!text-white'}
                      >
                        {transaction.amount} <span className={"font-medium dash-text-default"}>Credits</span>
                      </Text>
                      <div className={"flex items-baseline"}>
                        <Text size={10} weight={"medium"} color={"brand"} opacity={35}>
                        ~ ${transaction.usdAmount}
                        </Text>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )
    },
  ]

  return (
    <div className={"px-12 py-8"}>
      <div
        className={`
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
        <Button
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
            !min-h-fit
            rounded-[.3125rem]
          `}
        >
          <FilterIcon size={12} color={"currentColor"} className={"dash-text-default"} />
          <Text size={14} weight={"medium"} color={"brand"}>
            {filter}
          </Text>
        </Button>

        <Tabs
          items={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          size={"xl"}
          triggerClassName={'!text-dash-primary-dark-blue dark:!text-white font-medium tracking-[-0.03em]'}
        />
      </div>
    </div>
  )
}
