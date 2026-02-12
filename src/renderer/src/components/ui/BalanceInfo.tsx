import { Text } from "../dash-ui-kit-enxtended";

export default function BalanceInfo({isBalanceVisible}: {isBalanceVisible: boolean}): React.JSX.Element {
  return (
    <div
      className={`
        flex
        items-center
        gap-[.625rem]
        flex-wrap
        rounded-[.3125rem]
        dash-block-accent-10
        p-[.3125rem]
        w-fit
      `}
    >
      <Text size={14} weight={"normal"} color={"blue"}>
        ~ {isBalanceVisible ? '6222.00' : '•••••••••'} USD
      </Text>
      <div className={"w-px h-4 dash-block-accent-25"} />
      <Text size={14} weight={"normal"} color={"blue"}>
        {isBalanceVisible ? '320' : '•••••••••'}Dash
      </Text>
    </div>
  )
}
