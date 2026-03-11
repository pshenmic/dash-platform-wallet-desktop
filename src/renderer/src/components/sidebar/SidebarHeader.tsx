import { DashLogo } from "dash-ui-kit/react"
import Balance from "./Balance";
import { EyeClosedIcon, EyeOpenIcon } from "../dash-ui-kit-enxtended";
import { useState } from "react";

export default function SidebarHeader(): React.JSX.Element {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)

  return (
    <div className={"flex flex-col gap-8 justify-between w-full"}>
      <div className={"flex items-center justify-between w-full pl-3.75 relative [&>div.relative]:!static"}>
        <DashLogo width={30} height={35} containerSize={48}/>
        <button
          onClick={() => {setIsBalanceVisible(!isBalanceVisible)}}
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
        <Balance variant="dash" balance={320} />
        <Balance variant="credits" balance={32000000000}/>
      </div>
    </div>
  )
}
