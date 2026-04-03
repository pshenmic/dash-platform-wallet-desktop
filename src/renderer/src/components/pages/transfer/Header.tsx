import { Text } from "@renderer/components/dash-ui-kit-enxtended";
import { Asset } from "@renderer/hooks/useAssetSelector";
import { ChevronIcon } from "dash-ui-kit/react";
import { TransferPageType } from "@renderer/constants";

type HeaderData = Omit<TransferPageType['header'], 'description'> & {
  description: React.ReactNode
}

export default function Header({selectedAsset,  openModal, data}: {selectedAsset?: Asset, openModal?: () => void, data: HeaderData }): React.JSX.Element {
  return (
    <div className={"flex items-end justify-between px-12"}>
      <div className={"flex flex-col gap-4.5"}>
        <div className={"flex items-center gap-4.5 flex-wrap"}>
          <Text size={40} weight={"medium"} color={"brand"} className={"leading-[125%] tracking-[-0.03em]"}>{data.title}</Text>
          <button onClick={openModal} className={`
            p-[.25rem] pr-2 rounded-[.75rem] flex items-center gap-[.75rem] dash-block-accent-15
            ${openModal ? 'hover:opacity-80 transition-opacity duration-200 cursor-pointer' : ''}
          `}>
            <div className={"size-8 flex items-center justify-center rounded-[.5rem] dash-bg-inverse"}>
              {selectedAsset?.icon ?
                <img src={selectedAsset.icon} alt={selectedAsset.name} className={"size-4.5"} />
              :
                <Text size={20} weight={"medium"} color={"blue-mint"}>{selectedAsset?.initials}</Text>
              }
            </div>
            <Text size={24} weight={"medium"} color={"blue-mint"} className={"leading-[120%]"}>{selectedAsset?.name}</Text>
            { openModal && <ChevronIcon size={12} className={"text-dash-brand dark:text-dash-mint"} /> }
          </button>
        </div>
        <Text size={12} weight={"medium"} color={"brand"} opacity={50} className={"leading-[120%] max-w-152.5"}>{data.description}</Text>
      </div>
    </div>
  )
}
