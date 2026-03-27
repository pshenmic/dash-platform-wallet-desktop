import { NetworkValue } from "@renderer/hooks/useCreateWallet";
import { Text, WebIcon } from "../dash-ui-kit-enxtended";

export default function NetworkBadge({ network }: { network: NetworkValue }): React.JSX.Element {
  return (
    <div className={"absolute top-12 right-12 flex items-center justify-center gap-2 px-4 h-12 rounded-[.9375rem] bg-white/5 border border-white/15 backdrop-blur-[.5rem]"}>
      <WebIcon size={14} color={"white"}/>
      <Text size={14} weight={"medium"} className={"text-white leading-[120%]"}>{network}</Text>
    </div>
  )
}
