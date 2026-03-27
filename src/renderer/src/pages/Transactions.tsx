import { useState } from 'react'
import TransactionsList from "@renderer/components/pages/transactions/TransactionsList"
import TransactionDetail from "@renderer/components/pages/transactions/TransactionDetail"
import { TransactionType } from "@renderer/components/pages/transactions/TransactionCard"

export default function TransactionsPage(): React.JSX.Element {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null)

  if (selectedTransaction) {
    return (
      <div className={"flex flex-col"}>
        <TransactionDetail
          transaction={selectedTransaction}
          onBack={() => setSelectedTransaction(null)}
        />
      </div>
    )
  }

  return (
    <div className={"flex flex-col"}>
      <TransactionsList onTransactionClick={setSelectedTransaction} />
    </div>
  )
}
