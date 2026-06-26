import { useMemo, useState } from "react";
import { Button, Input, Text } from "@renderer/components/dash-ui-kit-enxtended";
import { TransferPageType } from "@renderer/constants";
import { useAuth } from "@renderer/contexts/AuthContext";
import { usePlatformAddresses, prefetchPlatformAddresses } from "@renderer/hooks/usePlatformAddresses";
import { isValidPlatformAddress } from "@renderer/utils/platformAddress";
import AmountInput from "./AmountInput";
import PlatformSendConfirmModal from "@renderer/components/modal/PlatformSendConfirmModal";

const MIN_OUTPUT_CREDITS = 500_000n
const TRANSFER_FEE_CREDITS = 6_500_000n

export default function PlatformTransferForm({pageData}: {pageData: TransferPageType}): React.JSX.Element {
  const { status } = useAuth()
  const walletId = status?.selectedWalletId ?? null
  const network = status?.network ?? null

  const { platformAddresses } = usePlatformAddresses(walletId ?? undefined)

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const availableCredits = useMemo(
    () => platformAddresses.reduce((max, a) => {
      const credits = BigInt(a.balanceCredits)
      return credits > max ? credits : max
    }, 0n),
    [platformAddresses],
  )

  const amountValid = /^\d+$/.test(amount.trim())
  const amountCredits = amountValid ? BigInt(amount.trim()) : 0n
  const amountAboveMin = amountCredits >= MIN_OUTPUT_CREDITS
  const amountWithinBalance = amountCredits + TRANSFER_FEE_CREDITS <= availableCredits

  const trimmedRecipient = recipient.trim()
  const addressValid = isValidPlatformAddress(trimmedRecipient, network ?? undefined)
  const recipientValid = trimmedRecipient.length === 0 || addressValid

  const canProceed = addressValid && amountAboveMin && amountWithinBalance

  const handleMax = (): void => {
    const spendable = availableCredits - TRANSFER_FEE_CREDITS
    setAmount(spendable > 0n ? spendable.toString() : '0')
  }

  return (
    <>
      <div className={"flex w-full justify-center flex-1"}>
        <div className={"flex flex-col w-115 mt-18.25 pb-18.25"}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            onMax={handleMax}
            balanceLabel={`${pageData.header.balance}: ${availableCredits.toString()} credits`}
            overBalance={amountCredits > 0n && !amountWithinBalance}
          />

          <div className={"flex flex-col gap-[.625rem] mt-6"}>
            <Text size={16} weight={"medium"} color={"brand"} opacity={50} className={"leading-[120%]"}>
              {pageData.recipient.label}
            </Text>
            <div className={"dash-input-search rounded-[.9375rem] px-6.25 py-5"}>
              <Input
                type={"text"}
                value={recipient}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
                className={"outline-none text-[.875rem] dash-text-default placeholder:opacity-40 !ring-0 p-0 w-full"}
                placeholder={network === 'mainnet' ? 'dash1…' : 'tdash1…'}
                colorScheme={"transparent"}
              />
            </div>
            {!recipientValid && (
              <span className={"text-[.75rem] text-dash-red"}>
                Enter a valid Platform {network ?? ''} address.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={"px-12"}>
        <div className={"flex flex-col gap-[.75rem]"}>
          <div className={"flex flex-col gap-[.75rem] p-[.75rem] rounded-[.9375rem] dash-card-base shadow-[0_0_35px_0_rgba(0,0,0,0.1)]"}>
            <div className={"flex justify-between items-center"}>
              <Text size={12} weight={"medium"} color={"default"} opacity={50}>{pageData.amountSummary.totalAmount}:</Text>
              <Text size={14} weight={"extrabold"} color={"default"}>{amountCredits.toString()} credits</Text>
            </div>
          </div>
          <Button
            className={"w-full rounded-[.9375rem]"}
            size={"md"}
            disabled={!canProceed}
            onClick={() => setConfirmOpen(true)}
          >
            {pageData.amountSummary.button}
          </Button>
        </div>
      </div>

      <PlatformSendConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        walletId={walletId}
        toAddress={trimmedRecipient}
        amountCredits={amountCredits.toString()}
        onSuccess={() => {
          setRecipient('')
          setAmount('')
          if (walletId) {
            prefetchPlatformAddresses(walletId)
          }
        }}
      />
    </>
  )
}
