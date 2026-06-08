import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, CrossIcon, Input, Text } from '../dash-ui-kit-enxtended'
import { useTheme } from 'dash-ui-kit/react'
import { API } from '@renderer/api'
import { SendResult } from '@renderer/api/types'
import { davToDash } from '@renderer/utils/balance'
import { shortenAddress } from '@renderer/utils/address'

interface SendConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string | null
  toAddress: string
  amountDuffs: bigint
  amountFiat?: string
  onSuccess: () => void
}

type Phase = 'confirm' | 'sending' | 'done'

export default function SendConfirmModal({
  isOpen,
  onClose,
  walletId,
  toAddress,
  amountDuffs,
  amountFiat,
  onSuccess,
}: SendConfirmModalProps): React.JSX.Element | null {
  const { theme } = useTheme()
  const [password, setPassword] = useState('')
  const [phase, setPhase] = useState<Phase>('confirm')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SendResult | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setPhase('confirm')
      setError(null)
      setResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async (): Promise<void> => {
    if (!walletId || password.length === 0 || phase === 'sending') return
    setPhase('sending')
    setError(null)
    try {
      const res = await API.sendTransaction(walletId, toAddress, amountDuffs.toString(), password)
      setResult(res)
      setPhase('done')
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setPhase('confirm')
    }
  }

  return createPortal(
    <div className={"fixed inset-0 z-99 bg-black/64 flex items-center justify-center"} onClick={onClose}>
      <div
        className={"w-full max-w-97.5 rounded-3xl bg-white dark:bg-white/12 p-6 dark:backdrop-blur-[2rem]"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={"flex items-center justify-between"}>
          <Text size={24} weight={"extrabold"} color={"brand"}>
            {phase === 'done' ? 'Transaction sent' : 'Confirm send'}
          </Text>
          <button className={"dash-text-default hover:opacity-60 cursor-pointer"} onClick={onClose}>
            <CrossIcon size={16} color={"currentColor"} className={"dash-text-default"} />
          </button>
        </div>

        {phase !== 'done' ? (
          <>
            <div className={"mt-4 flex flex-col gap-[.75rem] p-[.75rem] rounded-[.9375rem] dash-block-3"}>
              <div className={"flex justify-between items-center gap-4"}>
                <Text size={12} weight={"medium"} color={"brand"} opacity={50}>Amount:</Text>
                <Text size={14} weight={"extrabold"} color={"brand"}>{davToDash(amountDuffs)} Dash</Text>
              </div>
              {amountFiat && (
                <div className={"flex justify-between items-center gap-4"}>
                  <Text size={12} weight={"medium"} color={"brand"} opacity={50}>≈ Fiat:</Text>
                  <Text size={12} weight={"medium"} color={"blue-mint"}>{amountFiat}</Text>
                </div>
              )}
              <div className={"flex justify-between items-center gap-4"}>
                <Text size={12} weight={"medium"} color={"brand"} opacity={50}>To:</Text>
                <Text size={12} weight={"medium"} color={"brand"} className={"font-mono"}>{shortenAddress(toAddress)}</Text>
              </div>
            </div>

            <Text size={14} weight={"medium"} color={"brand"} opacity={40} className={"mt-4"}>
              Enter your wallet password to sign and broadcast.
            </Text>
            <div className={"mt-2"}>
              <Input
                id={"send-password"}
                type={"password"}
                placeholder={"Wallet password"}
                value={password}
                variant={"outlined"}
                onChange={(e) => { setError(null); setPassword(e.target.value) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
                className={"h-14.25 rounded-[1.25rem] bg-transparent!"}
                colorScheme={error ? 'error' : 'primary'}
                disabled={phase === 'sending'}
              />
            </div>
            {error && (
              <Text size={12} weight={"medium"} color={"red"} className={"mt-2"}>{error}</Text>
            )}

            <div className={"mt-4.5 flex gap-2"}>
              <Button
                type={"button"}
                onClick={onClose}
                variant={"solid"}
                colorScheme={theme === 'light' ? 'lightBlue-mint' : 'gray'}
                size={"md"}
                className={"flex-1 rounded-[.9375rem]"}
                disabled={phase === 'sending'}
              >
                Cancel
              </Button>
              <Button
                type={"button"}
                onClick={handleConfirm}
                disabled={password.length === 0 || phase === 'sending'}
                variant={"solid"}
                colorScheme={"brand-mint"}
                size={"md"}
                className={"flex-1 rounded-[.9375rem]"}
              >
                {phase === 'sending' ? 'Sending…' : 'Confirm'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={"mt-4 flex flex-col gap-[.75rem] p-[.75rem] rounded-[.9375rem] dash-block-3"}>
              <div className={"flex justify-between items-center gap-4"}>
                <Text size={12} weight={"medium"} color={"brand"} opacity={50}>Sent:</Text>
                <Text size={14} weight={"extrabold"} color={"brand"}>{result ? davToDash(BigInt(result.amount)) : ''} Dash</Text>
              </div>
              <div className={"flex justify-between items-center gap-4"}>
                <Text size={12} weight={"medium"} color={"brand"} opacity={50}>Network fee:</Text>
                <Text size={12} weight={"medium"} color={"brand"}>{result ? davToDash(BigInt(result.fee)) : ''} Dash</Text>
              </div>
              <div className={"flex flex-col gap-1"}>
                <Text size={12} weight={"medium"} color={"brand"} opacity={50}>Transaction ID:</Text>
                <Text size={12} weight={"medium"} color={"brand"} className={"font-mono break-all"}>{result?.txid}</Text>
              </div>
            </div>
            <div className={"mt-4.5"}>
              <Button
                type={"button"}
                onClick={onClose}
                variant={"solid"}
                colorScheme={"brand-mint"}
                size={"md"}
                className={"w-full rounded-[.9375rem]"}
              >
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
