import { ReceivePageType } from "@renderer/constants";
import Header from "../transfer/Heade";
import ReceiveAddressCard from "./ReceiveAddressCard";

const selectedAsset = {
  id: 'dash',
  name: 'Dash',
  symbol: 'DASH',
  initials: 'D',
  currency: 'DASH',
}

export default function Receive({pageData}: {pageData: ReceivePageType}): React.JSX.Element {
  return (
    <div className={`relative flex flex-col pb-12`}>
        <Header data={{...pageData.header, description:
          <span>This is your <span className={"font-extrabold"}>Dash</span>{' '}
           receival address. You can use this address to send funds to your wallet. It is{' '}
           <span className={"font-extrabold"}>highly suggested to not reuse the same address</span>{' '}
           for full privacy. You can also create a new address.
           </span>}}
          selectedAsset={selectedAsset}
        />
        <ReceiveAddressCard address={'Xk81u1LoHtvMATkD1DStguNYbNRHeXvs9d'} data={pageData.receiveAddressCard} />
    </div>
  )
}
