import { useAssetSelector, PLATFORM_CREDITS_ASSET_ID } from "@renderer/hooks/useAssetSelector";
import { TransferPageType } from "@renderer/constants";
import Header from "./Header";
import CoreTransferForm from "./CoreTransferForm";
import PlatformTransferForm from "./PlatformTransferForm";

const PLATFORM_HEADER: TransferPageType['header'] = {
  title: 'Send',
  description: 'Transfer Platform credits between Platform (L2) addresses. The funded address is selected automatically; enter a recipient Platform address and amount.',
  balance: 'Balance',
}

export default function TransferPage({pageData}: {pageData: TransferPageType}): React.JSX.Element {
  const { selectedAsset, assets, selectAsset } = useAssetSelector()
  const isPlatform = selectedAsset.id === PLATFORM_CREDITS_ASSET_ID

  return (
    <div className={"relative flex flex-col pb-12"}>
      <Header
        selectedAsset={selectedAsset}
        assets={assets}
        onSelectAsset={selectAsset}
        data={isPlatform ? PLATFORM_HEADER : pageData.header}
      />
      {isPlatform
        ? <PlatformTransferForm pageData={{...pageData, header: PLATFORM_HEADER}} />
        : <CoreTransferForm pageData={pageData} />}
    </div>
  )
}
