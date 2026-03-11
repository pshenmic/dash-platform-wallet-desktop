import Balance from "@renderer/components/pages/transactions/Balance";
import TransactionsList from "@renderer/components/pages/transactions/TransactionsList";

export default function TransactionsPage(): React.JSX.Element {
    return (
      <div className={"flex flex-col"}>
        <div className={"flex items-end justify-between px-12"}>
          <Balance />
        </div>
        <TransactionsList />
      </div>
    )
}
