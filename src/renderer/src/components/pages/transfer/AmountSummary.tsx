import { Button, Text } from "@renderer/components/dash-ui-kit-enxtended";
import { TransferPageType } from "@renderer/constants";

export default function AmountSummary({data}: {data: TransferPageType['amountSummary']}): React.JSX.Element {
  return (
    <div className={"px-12"}>
    <div className={"flex flex-col gap-[.75rem]"}>
      <div className={"flex flex-col gap-[.75rem] p-[.75rem] rounded-[.9375rem] dash-card-base shadow-[0_0_35px_0_rgba(0,0,0,0.1)]"}>
        <div className={"flex justify-between items-center"}>
          <Text size={12} weight={"medium"} color={"default"} opacity={50}>{data.fees}:</Text>
          <Text size={12} weight={"medium"} color={"default"} opacity={50}>~10 325 Credits</Text>
        </div>
        <div className={"flex justify-between items-center"}>
          <Text size={14} weight={"medium"} color={"default"}>{data.totalAmount}:</Text>
          <Text size={14} weight={"extrabold"} color={"default"}>7823000000 Credits</Text>
        </div>
      </div>
      <Button className={"w-full rounded-[.9375rem]"} size={"md"}>
        {data.button}
      </Button>
    </div>
  </div>
  )
}
