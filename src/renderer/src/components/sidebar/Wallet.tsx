import { Avatar, Identifier } from "dash-ui-kit/react";
import { Text } from "../dash-ui-kit-enxtended";
import { PlusIcon } from "../dash-ui-kit-enxtended/icons";
import { useState } from "react";
import { useRipple } from "@renderer/hooks/useRipple";

export default function Wallet(): React.JSX.Element {
  const [hasWallet, setHasWallet] = useState(false)
  const hover = useRipple()

  if (!hasWallet) {
    return (
      <button
        onClick={() => setHasWallet(true)}
        {...hover}
        className={`
          overflow-hidden
          relative
          flex
          items-center
          gap-4
          pt-2.5
          pr-6.25
          pb-2.5
          pl-3.75
          dash-block
          rounded-[.875rem]
          dash-black-border
          group
          cursor-pointer
        `}
      >
        <div
          className={`
            size-12.5
            dash-subtle
            rounded-full
            dash-black-border
            flex
            items-center
            justify-center
            shrink-0
            z-1
          `}
        >
          <PlusIcon
            size={14}
            color={'currentColor'}
            className={"dash-text-default"}
          />
        </div>
        <Text
          size={16}
          weight={"medium"}
          color={"brand"}
        >
          Add Identity
        </Text>
      </button>
    )
  }

  return (
    <div
      className={`
        flex
        items-center
        gap-4
        pt-2.5
        pr-6.25
        pb-2.5
        pl-3.75
        dash-block
        rounded-[.875rem]
        dash-black-border
      `}
    >
      <div
        className={`
          size-12.5
          dash-subtle
          rounded-full
          dash-black-border
          flex
          items-center
          justify-center
          shrink-0
        `}
      >
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
          className={"dash-text-default !text-base !font-medium"}
        >
          abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
        </Identifier>
        <Text size={12} weight="light" color="brand" opacity={50}>Main_account</Text>
      </div>
    </div>
  )
}
