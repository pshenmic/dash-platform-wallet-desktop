import AmountSummary from "@renderer/components/ui/AmountSummary"
import TransactionCardIcons from "./TransactionCardIcons"
import CustomBadge from "@renderer/components/ui/CustomBadge"
import { formatCreationDate, timePart } from "@renderer/utils/date"
import { BigNumber, TimeDelta } from "dash-ui-kit/react"
import { cva } from "class-variance-authority"
import { Text } from "@renderer/components/dash-ui-kit-enxtended"
import { WalletTxItem } from "@renderer/hooks/useWalletTransactions"
import { davToDash } from "@renderer/utils/balance"

// export interface TransactionType {
//   id: string,
//   status: 'failed' | 'success' | 'pending'
//   kind: 'core' | 'platform',
//   title: string,
//   subtitleLabel: 'from' | 'to' | 'hash' | 'towards identity',
//   labelValue: string,
//   amount: number,
//   usdAmount: number,
//   date: Date,
//   direction: 'in' | 'out'
// }

const transactionCardStyles = cva(
  `
    relative
    group
    flex
    items-center
    gap-4
    px-[.9375rem]
    py-[.625rem]
    rounded-[.875rem]
    dash-block
  `,
  {
    variants: {
      status: {
        failed: 'bg-dash-red-5 dark:bg-dash-red-15',
        success: '',
        pending: '',
      },
    },
  },
)

export default function TransactionCard({
  status,
  kind,
  title,
  subtitleLabel,
  labelValue,
  amount,
  usdAmount,
  date,
  direction
} : WalletTxItem): React.JSX.Element {
  const variantAmountSummary = status === 'failed' ? 'error' : kind === 'core' ? 'default' : 'muted'
  const isIncoming = direction === 'in'

  return (
    <div className={transactionCardStyles({ status })} >
      <TransactionCardIcons status={status} />
      <div className={"flex-1 flex flex-col gap-[.25rem]"}>
        <div className={"flex items-center gap-[.3125rem]"}>
          <CustomBadge text={kind ?? ''} variant={variantAmountSummary} size={"s"} />
          <Text size={12} weight={"medium"} color={"brand"} className={"leading-[120%]"}>
            {title}
          </Text>
        </div>

        <Text size={10} weight={"light"} color={"brand"} opacity={30}>
          {subtitleLabel}: {labelValue}
        </Text>
      </div>

      <AmountSummary
        total={
          <span className={isIncoming ? 'text-dash-brand dark:text-dash-mint' : ""}>
            {isIncoming ? '+' : '-'}<BigNumber className={"text-inherit"}>{davToDash(amount).toString()}</BigNumber>
          </span>
        }
        textBadge={`~ $${usdAmount}`}
        variant={variantAmountSummary}
        date={
          <>
            {formatCreationDate(new Date(date))} {timePart(new Date(date))} (<TimeDelta endDate={new Date(date)}/>)
          </>
        }
      />
      {/* <div className={`
        flex
        flex-col
        absolute
        left-10.25
        top-1/2
        -translate-y-1/2
        z-20
        transition-opacity
        duration-200
        rounded-[.75rem]
        shadow-[0_0_32px_0_rgba(0,0,0,0.12)]
        max-w-60
        dash-black-border
        dash-subtle
        py-[.5rem]
        dark:[backdrop-filter:blur(32px)]
        opacity-0
        pointer-events-none
        group-hover:opacity-100
        group-hover:pointer-events-auto
      `}>
        <Text size={10} weight={"extrabold"} color={"brand"} className={"mb-[.5rem] px-4"}>
          {status === 'pending' && 'Pending'}
          {status === 'success' && <span className={"dash-text-primary"}>Confirmed</span>}
          {status === 'failed' && <span className={"text-dash-red"}>Failed</span>}
          {' '}<span className={"font-medium"}>Transaction</span>
        </Text>
        <div className={"flex flex-col gap-[.5rem]"}>
          {(status === 'pending' || status === 'success') && (
            <>
              <div className={"flex flex-col gap-[.375rem]"}>
                <span className={"w-full h-[.0313rem] dash-block-5"}/>
                <div className={"flex items-center gap-[.5rem] px-4"}>
                  <CircleProcessIcon size={10} color={"currentColor"} className={"dash-text-default opacity-50 shrink-0"} />
                  <Text size={10} weight={"medium"} color={"brand"}>
                    <span className={"opacity-50"}>Type: </span>Standard
                  </Text>
                </div>
              </div>
              <div className={"flex flex-col gap-[.375rem]"}>
                <span className={"w-full h-[0.5px] dash-block-5"}/>
                <div className={"flex items-center gap-[.5rem] px-4"}>
                  <CheckCirclePartialIcon size={10} color={"currentColor"} className={"dash-text-default opacity-50 shrink-0"} />
                  <Text size={10} weight={"medium"} color={"brand"}>
                    <span className={"opacity-50"}>Confirmations: </span>0
                  </Text>
                </div>
              </div>
            </>
          )}
          {status === 'failed' && (
            <div className={"flex flex-col gap-[.5rem]"}>
              <span className={"w-full h-[0.5px] dash-block-5"}/>
              <Text size={10} weight={"medium"} color={"brand"} opacity={50} className={"px-4"}>
                <span className={"font-extrabold"}>Error: </span>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </div>
          )}
        </div>
      </div> */}
    </div>
  )
}
