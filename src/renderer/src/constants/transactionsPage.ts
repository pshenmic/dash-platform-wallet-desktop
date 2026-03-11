interface TransactionType {
  title: string
  detailLabel: string
}

interface TransactionsPage {
  balance: {
    balance: string
    usdPrice: string
    comparedToYesterday: string
  }
  transactions: {
    title: string
    filter: string
    types: {
      receive: TransactionType
      send: TransactionType
      documentsBatch: TransactionType
    }
  }
}

export const transactionsPage: TransactionsPage = {
  balance: {
    balance: 'Balance',
    usdPrice: 'USD price',
    comparedToYesterday: 'Compared to yesterday'
  },
  transactions: {
    title: 'Transactions',
    filter: 'Filter',
    types: {
      receive: {
        title: 'Receive',
        detailLabel: 'From:',
      },
      send: {
        title: 'Send',
        detailLabel: 'To:',
      },
      documentsBatch: {
        title: 'Documents Batch',
        detailLabel: 'Hash:',
      }
    }
  }
}
