import { Text } from "@renderer/components/dash-ui-kit-enxtended";
import { AssetSelectorPersistKey, useAssetSelector } from "@renderer/hooks/useAssetSelector";
import { ChevronIcon } from "dash-ui-kit/react";

export default function Header({persistKey}: {persistKey: AssetSelectorPersistKey}): React.JSX.Element {
  const { selectedAsset } = useAssetSelector({ persistKey })

  console.log(selectedAsset)

  return (
    <div className={"flex items-end justify-between gap-12 px-12"}>
      <div className={"flex flex-col gap-4.5"}>
        <div className={"flex items-center gap-4.5"}>
          <Text size={40} weight={"medium"} color={"brand"} className={"leading-[125%] tracking-[-0.03em]"}>Transfer</Text>
            <button className={"p-[.25rem] pr-2 rounded-[.75rem] flex items-center gap-[.75rem] bg-dash-brand/15"}>
              <div className={"size-8 flex items-center justify-center rounded-[.5rem] bg-white"}>
                {selectedAsset?.icon ?
                  <img src={selectedAsset.icon} alt={selectedAsset.name} className={"size-4.5"} />
                :
                  <Text size={20} weight={"medium"} color={"blue"}>{selectedAsset?.initials}</Text>
                }
              </div>
              <Text size={24} weight={"medium"} color={"blue"} className={"leading-[120%]"}>{selectedAsset?.name}</Text>
              <ChevronIcon size={12} className={"text-dash-brand dark:text-dash-mint"} />
            </button>
        </div>
        <Text size={12} weight={"medium"} color={"brand"} opacity={50} className={"leading-[120%]"}>You are going to transfer credits from you account with this transaction. Carefully check the transaction details before proceeding to the next step.</Text>
      </div>

    </div>
  )
}
