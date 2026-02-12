import TransferPage from "@renderer/components/pages/transfer/Page";
import { withdrawPage } from "@renderer/constants";

export default function WithdrawPage(): React.JSX.Element {
  const data = withdrawPage

  return (
    <TransferPage persistKey={"withdraw"} pageData={data} />
  )
}
