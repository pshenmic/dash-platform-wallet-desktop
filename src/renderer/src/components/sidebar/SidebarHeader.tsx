import { DashLogo } from "dash-ui-kit/react"
import Balance from "./Balance";
import { EyeClosedIcon, EyeOpenIcon } from "../dash-ui-kit-enxtended";
import { useEffect, useState } from "react";
import { API } from "@renderer/api";
import { useAuth } from "@renderer/contexts/AuthContext";
import { davToDash, formatCompactCredits } from "@renderer/utils/balance";

type AssetWithUsdValue = {
  amount: bigint
  usdAmount: string
}

interface BalanceType {
  dash: AssetWithUsdValue
  credits: AssetWithUsdValue
}

export default function SidebarHeader(): React.JSX.Element {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('wallet.balance.visible')
      return saved === null ? true : saved === "true"
    } catch {
      return true
    }
  })
  const { status } = useAuth()
  const [balance, setBalance] = useState<BalanceType | undefined>()

  const toggleBalanceVisibility = (): void => {
    setIsBalanceVisible((prev) => {
      const next = !prev
      try {
        localStorage.setItem('wallet.balance.visible', String(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    API.getWalletBalance(status?.selectedWalletId ?? '')
      .then((data) => {
        console.log('datagetWalletBalance', data)
        setBalance(data as BalanceType)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [status?.selectedWalletId])

  return (
    <div className={"flex flex-col gap-8 justify-between w-full"}>
      <div className={"flex items-center justify-between w-full pl-3.75 relative [&>div.relative]:!static"}>
        <DashLogo width={30} height={35} containerSize={48}/>
        <button
          onClick={toggleBalanceVisibility}
          className={`
            size-6
            dash-block
            rounded-[.25rem]
            p-[.25rem]
            flex
            items-center
            justify-center
            cursor-pointer
            hover:opacity-80
            transition-opacity
            duration-200
          `}
        >
          {isBalanceVisible ? (
            <EyeOpenIcon size={16} className={"dash-text-default"} />
          ) : (
            <EyeClosedIcon size={16} className={"dash-text-default"} />
          )}
        </button>
      </div>
      <div className={"flex flex-col gap-[.75rem]"}>
        <Balance variant="dash" balance={davToDash(balance?.dash.amount ?? 0n).toString()} isVisible={isBalanceVisible} usdAmount={balance?.dash.usdAmount ?? undefined}/>
        <Balance variant="credits" balance={formatCompactCredits(balance?.credits.amount ?? 0n).toString()} isVisible={isBalanceVisible} usdAmount={balance?.credits.usdAmount ?? undefined}/>
      </div>
    </div>
  )
}
