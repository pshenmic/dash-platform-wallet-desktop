import TransactionsList from "@renderer/components/pages/transactions/TransactionsList";

export default function TransactionsPage(): React.JSX.Element {
    return (
      <div className={"flex flex-col"}>
        <TransactionsList />
      </div>
    )
}
