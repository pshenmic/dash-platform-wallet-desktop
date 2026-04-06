import {AddressDAO} from '../database/AddressDAO'
import {GroupedAddresses} from "../types/GroupedAddresses";
import {WalletDAO} from "../database/WalletDAO";
import {InsightWalletProvider} from "../providers/InsightWalletProvider";

export class AddressesService {
  private addressDAO: AddressDAO
  private walletDAO: WalletDAO

  constructor(walletDAO: WalletDAO, addressDAO: AddressDAO) {
    this.addressDAO = addressDAO
    this.walletDAO = walletDAO
  }

  async getAddressesByWalletId(walletId: string): Promise<GroupedAddresses> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    const addresses = await this.addressDAO.getAddressesByWalletId(walletId)

    const provider = new InsightWalletProvider(wallet.network)

    // TODO: add real usd balance
    const receivingAddressesWithBalance = await Promise.all(addresses.receiving.map(async (address) => ({
        ...address,
        balance: await provider.getBalance(address.address),
        usdBalance: '0.0'
      })
    ))

    const changeAddressesWithBalance = await Promise.all(addresses.change.map(async (address) => ({
        ...address,
        balance: await provider.getBalance(address.address),
        usdBalance: '0.0'
      })
    ))

    return {
      receiving: receivingAddressesWithBalance,
      change: changeAddressesWithBalance
    }
  }
}
