import TransferPage from "@renderer/components/pages/transfer/Page";
import { receivePage } from "@renderer/constants";

export default function ReceivePage(): React.JSX.Element {
  const data = receivePage

  return (
    <TransferPage persistKey={"receive"} pageData={data} />
  )
}
