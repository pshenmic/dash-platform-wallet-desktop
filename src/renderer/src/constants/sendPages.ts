export interface TransferPageType {
  header: {
    title: string
    description: string
    balance: string
  }
  recipient: {
    label: string
    placeholder: string
    addressBook: string
    addressManagement: string
    names: string
    noResults: string
  }
  amountSummary: {
    fees: string
    totalAmount: string
    button: string
  }
}

export const sendPageData: TransferPageType = {
  header: {
    title: 'Transfer',
    description: 'You are going to transfer credits from you account with this transaction. Carefully check the transaction details before proceeding to the next step.',
    balance: 'Balance',
  },
  recipient: {
    label: 'Recipient',
    placeholder: 'Enter address or search name',
    addressBook: 'Address Book',
    addressManagement: 'Address Management',
    names: 'Names',
    noResults: 'No addresses found',
  },
  amountSummary: {
    fees: 'Fees:',
    totalAmount: 'Total Amount:',
    button: 'Next',
  }
}
