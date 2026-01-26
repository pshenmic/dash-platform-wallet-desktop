import { Avatar, Identifier } from "dash-ui-kit/react";
import { Typography } from "../ui/Typography";

export default function Wallet(): React.JSX.Element {
  return (
    <div className={"flex items-center gap-4 pt-2.5 pr-6.25 pb-2.5 pl-3.75 bg-black/3 rounded-14"}>
        <div className={"size-12.5 bg-white rounded-full flex items-center justify-center shrink-0"}>
          <Avatar
            username={"santa"}
            width={24}
            height={24}
            className={"size-7"}
          />
        </div>
        <div className={"flex flex-col gap-1.25"}>
          <Identifier
            username={"santa"}
            middleEllipsis={true}
            edgeChars={4}
            className={"text-black !text-base !font-medium"}
          >
            abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
          </Identifier>
          <Typography variant={"caption"} color={"default"} opacity={50}>Main_account</Typography>
        </div>
      </div>
  )
}
