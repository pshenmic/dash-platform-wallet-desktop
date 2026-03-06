import { AddressDAO } from '../database/AddressDAO'
import { Address } from '../types/Address'

export class AddressesService {
  private addressDAO: AddressDAO

  constructor(addressDAO: AddressDAO) {
    this.addressDAO = addressDAO
  }

  async getAddressesByWalletId(walletId: string): Promise<Address[]> {
    return this.addressDAO.getAddressesByWalletId(walletId)
  }
}