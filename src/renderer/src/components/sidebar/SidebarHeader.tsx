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
    rounded-[15px]
    cursor-pointer
    transition-[bg,scale,translate]
    duration-300
    ease
    bg-dash-primary-dark-blue/3 dark:bg-white/4
    hover:bg-dash-brand/20 dark:hover:bg-dash-mint/15
    dark:border-1 dark:border-white/12
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
        <button className={toggleButtonStyles()} onClick={onToggle}>
          <ChevronIcon
            size={17}
            className={`
          text-dash-primary-dark-blue
            rotate-90
          group-hover:text-dash-brand
          dark:text-white
          group-hover:dark:text-dash-mint
          `}/>
        </button>
      </div>
      <Wallet />
    </div>
  )
}
