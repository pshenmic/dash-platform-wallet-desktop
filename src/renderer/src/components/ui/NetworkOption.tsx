import { cva } from "class-variance-authority"
import { CheckIcon, Text } from "../dash-ui-kit-enxtended"
import { DashLogo } from "dash-ui-kit/react"
import { NetworkValue } from "@renderer/hooks/useCreateWallet"


export type NetworkOptionProps = {
  value: NetworkValue
  label: string
  selected: boolean
  onSelect: (value: NetworkValue) => void
}

const networkOptionStyles = cva(
  `
    w-full
    flex
    justify-between
    items-center
    rounded-[.9375rem]
    px-[.9375rem]
    py-[.625rem]
    cursor-pointer
    border-l-2
    border-l-transparent
    transition-all
    duration-250
    ease-in-out
  `,
  {
    variants: {
      selected: {
        true: `
          dash-block-accent-15
          border-l-dash-brand! dark:border-l-dash-mint!
          scale-[1.01]
        `,
        false: `
          dash-block
          hover:opacity-90
        `
      }
    }
  }
)

export const NetworkOption: React.FC<NetworkOptionProps> = ({
  value,
  label,
  selected,
  onSelect,
}) => {
  return (
    <button
      type={"button"}
      role={"radio"}
      aria-checked={selected}
      className={networkOptionStyles({ selected })}
      onClick={() => onSelect(value)}
    >
      <span className={"flex items-center gap-3"}>
        <span className={`
          flex items-center justify-center rounded-full size-9.75
          transition-all duration-250 ease-in-out
          ${selected
            ? "dash-block-accent scale-110"
            : "dash-block scale-100"
          }
        `}>
          <DashLogo
            size={20}
            color={"currentColor"}
            className={`
              transition-all duration-250 ease-in-out
              ${selected
                ? "text-white! dark:text-dash-primary-dark-blue!"
                : "text-dash-primary-dark-blue! dark:text-white!"
              }
            `}
          />
        </span>
        <Text size={14} weight={"medium"} color={ selected ? "blue-mint" : "brand"}>{label}</Text>
      </span>

      <span
        className={`
          flex items-center justify-center
          transition-all duration-250 ease-in-out
          ${selected
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-75 translate-x-2 pointer-events-none"
          }
        `}
      >
        <CheckIcon
          size={24}
          color={"currentColor"}
          className="dash-text-primary [&_circle]:fill-dash-brand/12 dark:[&_circle]:fill-dash-mint/12"
        />
      </span>
    </button>
  )
}
