import { cva } from "class-variance-authority"
import { DashLogo, ChevronIcon } from "dash-ui-kit/react"
import { useRipple } from "@renderer/hooks/useRipple";
import Wallet from "./Wallet";

interface SidebarHeaderProps {
  onToggle: () => void;
}

const toggleButtonStyles = cva(
  `
    relative
    overflow-hidden
    size-12
    flex
    items-center
    justify-center
    rounded-[.9375rem]
    cursor-pointer
    dash-block
    dash-black-border
  `
)

export default function SidebarHeader({ onToggle }: SidebarHeaderProps): React.JSX.Element {
  const hover = useRipple()

  return (
    <div className={"flex flex-col gap-8 justify-between w-full"}>
      <div className={"flex items-center justify-between w-full pl-3.75 relative [&>div.relative]:!static"}>
        <DashLogo width={30} height={35} containerSize={48}/>
        <button {...hover} className={toggleButtonStyles()} onClick={onToggle}>
          <ChevronIcon
            size={17}
            className={`
            dash-text-default
            rotate-90
          `}/>
        </button>
      </div>
      <Wallet />
    </div>
  )
}
