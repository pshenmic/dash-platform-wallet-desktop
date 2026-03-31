import {Address} from '../types/Address'
import {GroupedAddresses} from "../types/GroupedAddresses";
import {OperationStatus} from "../types/OperationStatus";
import {KnexProvider} from "../providers/knexProvider";

function fromRow({wallet_id, account_id, address, derivation_path, index, is_change, label}): Address {
  return {
    walletId: wallet_id,
    accountId: account_id,
    address,
    derivationPath: derivation_path,
    index,
    isChange: is_change,
    balance: null,
    label
  }
}

export class AddressDAO {
  private knexProvider: KnexProvider

  constructor(knexProvider: KnexProvider) {
    this.knexProvider = knexProvider
  }

  insertAddresses = async (addresses: Address[]): Promise<void> => {
    await this.knexProvider.knex('addresses').insert(
      addresses.map(e => ({
        wallet_id: e.walletId,
        account_id: e.accountId,
        address: e.address,
        derivation_path: e.derivationPath,
        index: e.index,
        is_change: e.isChange,
        label: e.label,
      }))
    )
  }

  getAddressesByWalletId = async (walletId: string): Promise<GroupedAddresses> => {
    const rows = await this.knexProvider.knex('addresses')
      .select('wallet_id', 'account_id', 'address', 'derivation_path', 'index', 'is_change', 'label')
      .where('wallet_id', walletId)
      .orderBy('index', 'asc')

    return rows.reduce((acc, row) => {
      const address = fromRow(row)
      if (row.is_change === true) {
        return {
          ...acc,
          change: [...acc.change, address],
        }
      } else {
        return {
          ...acc,
          receiving: [...acc.receiving, address],
        }
      }
    }, {receiving: [], change: []})
  }

  setAddressLabel = async (walletId: string, address: string, label: string): Promise<OperationStatus> => {
    const result = await this.knexProvider.knex('addresses')
      .where('address', address)
      .andWhere('wallet_id', walletId)
      .update({
        label: label
      })

    if (result > 0) {
      return {
        success: true,
        errorMessage: null,
      }
    } else {
      return {
        success: false,
        errorMessage: "address or wallet not found",
      }
    }

  }
}
