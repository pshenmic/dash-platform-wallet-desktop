import { Text } from "@renderer/components/dash-ui-kit-enxtended";
import { Asset } from "@renderer/hooks/useAssetSelector";
import { BigNumber, ChevronIcon } from "dash-ui-kit/react";
import { TransferPageType } from "@renderer/constants";
import BalanceInfo from "@renderer/components/ui/BalanceInfo";

export default function Header({selectedAsset,  openModal, data}: {selectedAsset?: Asset, openModal: () => void, data: TransferPageType['header']}): React.JSX.Element {
  return (
    <div className={"flex items-end justify-between gap-12 px-12"}>
      <div className={"flex flex-col gap-4.5"}>
        <div className={"flex items-center gap-4.5 flex-wrap"}>
          <Text size={40} weight={"medium"} color={"brand"} className={"leading-[125%] tracking-[-0.03em]"}>{data.title}</Text>
          <button onClick={openModal} className={"p-[.25rem] pr-2 rounded-[.75rem] flex items-center gap-[.75rem] dash-block-accent-15 cursor-pointer hover:opacity-80 transition-opacity duration-200"}>
            <div className={"size-8 flex items-center justify-center rounded-[.5rem] dash-bg-inverse"}>
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
        <Text size={12} weight={"medium"} color={"brand"} opacity={50} className={"leading-[120%] max-w-112.5"}>{data.description}</Text>
      </div>
      <div className={"flex flex-col gap-[.5rem] px-6 py-4.25 dash-card-base rounded-3xl shadow-[0_0_32px_0_rgba(12,28,51,0.08)]"}>
        <Text size={14} weight={"medium"} color={"brand"} opacity={32} className={"leading-[100%] tracking-[-0.01em]"}>{data.balance}</Text>
        <Text size={20} weight={"extrabold"} color={"brand"} className={"leading-[100%]"}>
          <BigNumber>32 000 000 000 000</BigNumber>
        </Text>
        <BalanceInfo isBalanceVisible={true} />
      </div>
    </div>
  )
}
