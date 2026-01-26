import { cva } from "class-variance-authority"
import { DashLogo, ChevronIcon } from "dash-ui-kit/react"
import Wallet from "./Wallet";

interface SidebarHeaderProps {
  onToggle: () => void;
}

const toggleButtonStyles = cva(
  `
    size-12
    flex
    items-center
    justify-center
    rounded-15
    cursor-pointer
    transition-bg
    transition-scale
    transition-shadow
    duration-300
    ease-out
    bg-black/3
    hover:bg-blue/20
    hover:scale-102
    hover:shadow-md
    hover:-translate-y-0.5
    group
  `
)

export default function SidebarHeader({ onToggle }: SidebarHeaderProps): React.JSX.Element {
  return (
    <div className={"flex flex-col gap-8 justify-between w-full"}>
      <div className={"flex items-center justify-between w-full pl-3.75 relative [&>div.relative]:!static"}>
        <DashLogo width={30} height={35} containerSize={48}/>
        <div className={toggleButtonStyles()} onClick={onToggle}>
          <ChevronIcon size={17} color={"var(--color-black)"} className={"rotate-90 group-hover:text-blue"}/>
        </div>
      </div>
      <Wallet />
    </div>
  )
}
