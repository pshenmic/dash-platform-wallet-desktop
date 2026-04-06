import { useAssetSelector } from "@renderer/hooks/useAssetSelector";
import { useCurrencySelector } from "@renderer/hooks/useCurrencySelector";
import { useState } from "react";
import { selectAssetData, TransferPageType } from "@renderer/constants";
import Header from "./Header";
import AssetSelectorModal from "@renderer/components/modal/AssetSelectorModal";
import AmountInput from "./AmountInput";
import RecipientInput from "./RecipientInput";
import AmountSummary from "./AmountSummary";

export default function TransferPage({pageData}: {pageData: TransferPageType}): React.JSX.Element {
  const { selectedAsset, assets, showModal, closeModal, selectAsset, openModal } = useAssetSelector()
  const { selectedCurrency, currencies, selectCurrency } = useCurrencySelector()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const assetSelector = selectAssetData

  const BALANCE = 99999

  const handleMax = () => {
    setAmount(BALANCE.toString())
  }

  return (
    <>
    <div className={`relative flex flex-col pb-12 ${showModal ? 'hidden' : ''}`}>
      <div>
        <Header selectedAsset={selectedAsset} openModal={openModal} data={pageData.header}/>
        <div className={"flex w-full justify-center flex-1"} >
          <div className={"flex flex-col w-115 mt-18.25 pb-18.25"}>
            <AmountInput
              value={amount}
              onChange={setAmount}
              onMax={handleMax}
              selectedCurrency={selectedCurrency}
              currencies={currencies}
              onSelectCurrency={selectCurrency}
            />
            <RecipientInput
              value={recipient}
              onChange={setRecipient}
              data={pageData.recipient}
            />
          </div>
        </div>
      </div>
      <AmountSummary data={pageData.amountSummary} />
    </div>
    <AssetSelectorModal
        isOpen={showModal}
        onClose={closeModal}
        assets={assets}
        selectedAssetId={selectedAsset?.id}
        onSelectAsset={selectAsset}
        data={assetSelector}
      />
    </>
  )
}
