import { Avatar, BigNumber, Identifier, TimeDelta } from "dash-ui-kit/react";
import { Identity } from "./Page";
// import { Text } from "@renderer/components/dash-ui-kit-enxtended";
import AmountSummary from "@renderer/components/ui/AmountSummary";
import { formatCompactCredits } from "@renderer/utils/balance";
// import { formatCreationDate } from "@renderer/utils/date";

export default function IdentityCard({identity}: {identity: Identity}): React.JSX.Element {
  return (
    <div className={"flex items-center w-full dash-block rounded-[.875rem] px-[.9375rem] py-[.625rem]"}>
      <div className={"flex items-center justify-center size-8.5 rounded-full dash-subtle shrink-0"}>
        <Avatar sizes={"14"} /*username={identity.names}*/ username={identity.walletAddress}/>
      </div>
      <div className={"flex flex-col ml-[.5rem]"}>
        <Identifier highlight={"default"} className={"font-mono text-[.75rem]!"}>
          {identity.walletAddress}
        </Identifier>
        {/* <Text size={10} weight={"medium"} color={"default"} opacity={50}>Names: <span className={"font-bold"}>{identity.names}</span></Text> */}
      </div>
      <AmountSummary total={<BigNumber className={"text-inherit gap-[.125rem]!"}>{formatCompactCredits(identity.balance.total).toString()}</BigNumber>}
      textBadge={`~ $${identity.balance.approx}`}
      currency={identity.balance.currency}
      //  date={
      //   <>
      //     Creation date: {' '}
      //     {formatCreationDate(new Date(identity.creationDate))} (<TimeDelta endDate={new Date(identity.creationDate)}/>)
      //   </>
      //  }
      />
    </div>
  )
}
