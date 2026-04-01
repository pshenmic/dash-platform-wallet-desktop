import { ClockArrowIcon, CheckIcon, ErrorIcon } from "@renderer/components/dash-ui-kit-enxtended/icons";
import { WalletTxItem } from "@renderer/hooks/useWalletTransactions";
import { cva } from "class-variance-authority";

const transactionCardIconsStyles = cva(
  `
    shrink-0
  `,
  {
    variants: {
      status: {
        failed: 'rounded-full text-dash-red [&_rect]:[fill-opacity:0.12]',
        success: 'dash-text-primary [&_circle]:fill-current [&_circle]:[fill-opacity:0.12] dark:[&_circle]:[fill-opacity:0.04]',
        pending: 'dash-text-default [&_circle]:fill-current [&_circle]:[fill-opacity:0.05] dark:[&_circle]:[fill-opacity:0.04]',
      },
    },
  },
)

export default function TransactionCardIcons({ status }: { status: WalletTxItem['status'] }): React.JSX.Element {
  const iconProps = { size: 18, color: 'currentColor' as const, className: transactionCardIconsStyles({ status }) };

  return (
    <>
       {status === 'pending' ? (
        <ClockArrowIcon {...iconProps} />
      ) : status === 'success' ? (
        <CheckIcon {...iconProps} />
      ) : (
        <ErrorIcon {...iconProps} />
      )}
    </>
  )
}
