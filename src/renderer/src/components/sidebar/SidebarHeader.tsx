import { DashLogo } from "dash-ui-kit/react"
import Balance from "./Balance";
import { EyeClosedIcon, EyeOpenIcon } from "../dash-ui-kit-enxtended";
import { useEffect, useState } from "react";
import { API } from "@renderer/api";

type AssetWithUsdValue = {
  amount: bigint
  usdAmount: number
}

interface Balance {
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
  const [balance, setBalance] = useState<number>(0)

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
    API.getWalletBalance('43997f03')
      .then((data) => {
        console.log('data', data)
        // setBalance(data.balance)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [balance])

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
        <Balance variant="dash" balance={320} isVisible={isBalanceVisible}/>
        <Balance variant="credits" balance={32000000000} isVisible={isBalanceVisible}/>
      </div>
    </div>
  )
}
