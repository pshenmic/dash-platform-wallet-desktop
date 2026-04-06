import Receive from "@renderer/components/pages/receive/Page";
import { receivePage } from "@renderer/constants";

export default function ReceivePage(): React.JSX.Element {
  const data = receivePage

  return (
    <Receive pageData={data} />
  )
}
