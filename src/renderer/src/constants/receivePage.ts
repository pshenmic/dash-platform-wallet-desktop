import { TransferPageType } from "./sendPages";

export const receivePage: TransferPageType = {
  header: {
    title: 'Withdraw',
    description: 'You are going to transfer Dash from you account with this transaction. Carefully check the transaction details before proceeding to the next step.',
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
