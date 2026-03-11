import TransferPage from "@renderer/components/pages/transfer/Page";
import { sendPageData } from "@renderer/constants";

export default function SendPage(): React.JSX.Element {
  const data = sendPageData

  return (
    <TransferPage persistKey={"send"} pageData={data} />
  )
}
