import { navGroups } from "@renderer/constants";
import { FaceIcon, SendIcon, SettingsIcon, ShieldSmallIcon, TokensIcon, TransactionsIcon, WithdrawIcon, ChevronIcon } from "../dash-ui-kit-enxtended/icons";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { IconProps } from "../dash-ui-kit-enxtended/icons";
import SidebarHeader from "./SidebarHeader";
import SidebarNavGroup from "./SidebarNavGroup";

const iconMap: Record<string, React.FC<IconProps>> = {
  'transactions': TransactionsIcon,
  'send': SendIcon,
  'withdraw': WithdrawIcon,
  'tokens': TokensIcon,
  'names': FaceIcon,
  'support': ShieldSmallIcon,
  'settings': SettingsIcon
}

const asideStyles = cva(
  `
    relative
    h-screen
    flex
    flex-col
    w-64
    bg-white dark:bg-transparent
    dark:border-r-1 dark:border-white/32
    rounded-r-[2rem]
    shrink-0
    shadow-[8px_0_64px_0_rgba(12,28,51,0.08)]
    transition-[margin-left]
    duration-300
    ease
    z-20
  `,
  {
    variants: {
      isOpen: {
        true: 'ml-0 delay-100',
        false: '-ml-64 delay-0'
      }
    }
  }
)

const openSidebarButtonStyles = cva(
  `
    fixed
    top-12
    h-12
    w-12
    flex
    z-100
    items-center
    justify-center
    rounded-r-[.9375rem]
    cursor-pointer
    dash-block-accent
    hover:shadow-lg
    hover:[transform:translateX(0.2rem)]
    [transition:left_500ms_ease-out,opacity_300ms_ease-out,transform_300ms_ease-out,box-shadow_300ms_ease-out]
  `,
  {
    variants: {
      isOpen: {
        true: `
          -left-full
          opacity-0
          pointer-events-none
        `,
        false: `
          -left-2
          opacity-100
          pointer-events-auto
        `
      }
    }
  }
)

export default function Sidebar(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <aside className={asideStyles({ isOpen })}>
        <div className={"flex flex-col h-full w-full justify-between gap-12 overflow-auto py-12 px-6 items-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
          <SidebarHeader onToggle={() => setIsOpen(!isOpen)}/>
          <div className={"flex flex-col h-full w-full justify-between gap-12"}>
            {navGroups.map((group) => (
              <SidebarNavGroup
                key={group.id}
                items={group.items.map((item) => ({
                  items: item,
                  icon: iconMap[item.id]
                }))}
              />
            ))}
          </div>
        </div>
      </aside>
      <button aria-label={"Open sidebar"} className={openSidebarButtonStyles({ isOpen })} onClick={() => setIsOpen(true)}>
        <ChevronIcon
        size={17}
        className={`
         -rotate-90
        dash-text-inverse
        `}/>
      </button>
    </>
  )
}
