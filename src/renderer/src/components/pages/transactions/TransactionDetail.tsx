import { Identifier, BigNumber, useTheme, TimeDelta, ChevronIcon, DashLogo } from 'dash-ui-kit/react'
import { cva } from 'class-variance-authority'
import { Text } from '@renderer/components/dash-ui-kit-enxtended'
import {
  BoxIcon,
  CalendarIconHighlighted,
  CheckIcon,
  DocumentIcon,
} from '@renderer/components/dash-ui-kit-enxtended/icons'
import CustomBadge from '@renderer/components/ui/CustomBadge'
import CopyButton from '@renderer/components/ui/CopyButton'
import { transactionsPage } from '@renderer/constants'
import { TransactionType } from './TransactionCard'
import QrButton from '@renderer/components/ui/QrButton'
import { formatCreationDate, timePart } from '@renderer/utils/date'
import { useRipple } from '@renderer/hooks/useRipple'

interface OutputItem {
  address: string
  amount: number
  receiving?: boolean
}

interface InputItem {
  hash: string
}

const MOCK_TX_HASH = '6bd3c4a41d4d34b1806de0cf566ddd26b0ae53d979da4bfadbcc4f6af526a4b6'
const MOCK_SIZE = 225
const MOCK_CONFIRMATIONS = 3874
const MOCK_LOCK_TIME = 2431476

const MOCK_INPUTS: InputItem[] = [
  { hash: '6cb710d3cf1ae0ee579fe8bc604cae2e1fd57933d34c2a1f22ca2ad1227c5c9c:3' },
]

const MOCK_OUTPUTS: OutputItem[] = [
  { address: 'Xdxs2Wb2z3GUvLbj6aQobnBCKV3jXdLcSZ', amount: 37.0, receiving: true },
  { address: 'XcAY5amfZ4qr8WrzppGxLQ3uGpCYFb19zC', amount: 112.99999775 },
]

const cardStyles = cva(
  'flex flex-col gap-5 p-[.9375rem] rounded-[.9375rem] dash-card-base shadow-[0_0_50px_0_rgba(0,0,0,0.1)]'
)

const detailTokenStyles = cva(
  'flex flex-1 items-center justify-between p-3 rounded-xl dash-block'
)

const iconCircleStyles = cva(
  'flex size-[1.875rem] shrink-0 items-center justify-center rounded-full bg-dash-brand/12 dark:bg-dash-mint/12',
)

interface TransactionDetailProps {
  transaction: TransactionType
  onBack: () => void
}

function DetailToken({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className={detailTokenStyles()}>
      <div className={"flex items-center gap-[.625rem]"}>
        <span className={iconCircleStyles()}>
          {icon}
        </span>
        <Text size={14} weight={"medium"} color={"brand"}>
          {label}
        </Text>
      </div>
      <div className={"flex flex-col items-end gap-[.3125rem]"}>
        <div>{value}</div>
        {subValue && (
          <Text size={10} weight={"medium"} color={"brand"} opacity={30}>
            {subValue}
          </Text>
        )}
      </div>
    </div>
  )
}

export default function TransactionDetail({ transaction, onBack }: TransactionDetailProps): React.JSX.Element {
  const { detail } = transactionsPage
  const { theme } = useTheme()
  const isIncoming = transaction.direction === 'in'
  const hoverNotification = useRipple()

  return (
    <div className={"flex flex-col gap-4 px-12 pb-8"}>
      <div className={"flex items-center gap-4.5 mb-5"}>
        <button
          onClick={onBack}
          {...hoverNotification}
          className={"relative overflow-hidden flex size-12 shrink-0 items-center justify-center rounded-[.9375rem] dash-block dash-black-border hover:opacity-70 transition-opacity cursor-pointer"}
        >
          <ChevronIcon
            size={17}
            className={`
            dash-text-default
            rotate-90
          `}/>
        </button>
        <Text size={40} weight={"medium"} color={"brand"} className={"tracking-[-0.03em]"}>
          <span className={"opacity-50"}>{detail.titlePrefix}</span>
          {' '}{transaction.title}
        </Text>
      </div>

      <div className={cardStyles()}>
        <div className={"flex items-center gap-[.625rem]"}>
          <span className={iconCircleStyles()}>
            <DocumentIcon size={14} color={"currentColor"} className={"dash-text-primary"} />
          </span>
          <Text size={14} weight={"medium"} color={"brand"}>
            {detail.transactionId}:
          </Text>
        </div>
        <div className={"flex items-center gap-[.3125rem]"}>
          <Identifier className={"font-mono font-extrabold!"} >
            {MOCK_TX_HASH}
          </Identifier>
          <CopyButton text={MOCK_TX_HASH} />
          <QrButton />
        </div>
      </div>

      <div className={cardStyles()}>
        <div className={"flex items-center justify-between"}>
          <Text size={14} weight={"medium"} color={"brand"} className={"tracking-[-0.03em]"}>
            {detail.details}:
          </Text>
          <Text size={14} weight={"medium"} color={"brand"} opacity={50} className={"tracking-[-0.03em]"}>
            {detail.size}: {MOCK_SIZE} {detail.bytes}
          </Text>
        </div>

        <div className={"flex flex-col gap-3"}>
          <div className={"flex gap-3"}>
            <DetailToken
              icon={<CalendarIconHighlighted size={14} color={"currentColor"} className={"dash-text-primary"} />}
              label={`${detail.fields.date}:`}
              value={
                <Text size={14} weight={"extrabold"} color={"brand"}>
                    {formatCreationDate(transaction.date)} <span className={"font-medium"}>{timePart(transaction.date)}</span>
                </Text>
              }
              subValue={<TimeDelta endDate={transaction.date} />}
            />
            <DetailToken
              icon={<DashLogo size={14} color={theme === 'light' ? 'var(--color-dash-brand)' : 'var(--color-dash-mint)'} className={"dash-text-primary"} />}
              label={`${detail.fields.amount}:`}
              value={
                <Text size={14} weight={"medium"} color={"brand"}>
                  <span className={`font-extrabold ${isIncoming ? 'dash-text-primary' : ''}`}>
                    {isIncoming ? '+ ' : '- '}
                    <BigNumber className={"text-inherit"}>{transaction.amount}</BigNumber>
                  </span>
                  {' Dash'}
                </Text>
              }
              subValue={`~ $${transaction.usdAmount}`}
            />
          </div>
          <div className={"flex gap-3"}>
            <DetailToken
              icon={<CheckIcon size={30} color={"currentColor"} className={"dash-text-primary [&_circle]:hidden"} />}
              label={`${detail.fields.confirmations}:`}
              value={
                <Text size={14} weight={"medium"} color={"brand"}>
                  <BigNumber className={"gap-0!"}>{MOCK_CONFIRMATIONS}</BigNumber>
                </Text>
              }
            />
            <DetailToken
              icon={<BoxIcon size={14} color={"currentColor"} className={"dash-text-primary"} />}
              label={`${detail.fields.lockTime}:`}
              value={
                <Text size={14} weight={"medium"} color={"brand"}>
                  <BigNumber className={"gap-0!"}>{MOCK_LOCK_TIME}</BigNumber>
                </Text>
              }
              subValue={detail.fields.height}
            />
          </div>
        </div>
      </div>

      <div className={cardStyles()}>
        <div className={"flex items-center gap-2"}>
          <Text size={14} weight={"medium"} color={"brand"} className={"tracking-[-0.03em]"}>
            {detail.inputs}:
          </Text>
          <CustomBadge text={MOCK_INPUTS.length.toString()} variant={"muted"} size={"xs"} />
        </div>
        <div className={"flex flex-col gap-3"}>
          {MOCK_INPUTS.map((input, i) => (
            <div key={`input-${i}`}>
              <Identifier className={"font-mono opacity-40 dark:opacity-100"}>
                {input.hash}
              </Identifier>
            </div>
          ))}
        </div>
      </div>

      <div className={cardStyles()}>
        <div className={"flex items-center gap-2"}>
          <Text size={14} weight={"medium"} color={"brand"} className={"tracking-[-0.03em]"}>
            {detail.outputs}:
          </Text>
          <CustomBadge text={MOCK_OUTPUTS.length.toString()} variant={"muted"} size={"xs"} />
        </div>
        <div className={"flex flex-col gap-3"}>
          {MOCK_OUTPUTS.map((output, i) => (
            <div key={`output-${i}`} className={"flex items-center gap-2 justify-between"}>
              <div className={"flex items-center gap-2 flex-1 min-w-0"}>
                <Identifier maxLines={1}>{output.address}</Identifier>
                {output.receiving && (
                  <CustomBadge text={detail.receivingBadge} variant={"default"} size={"xs"} className={"shrink-0"} />
                )}
              </div>
              <Text size={14} weight={"medium"} color={"brand"} className={"shrink-0"}>
                <span className={"font-extrabold"}>
                  <BigNumber>{output.amount}</BigNumber>
                </span>
                {' Dash'}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
