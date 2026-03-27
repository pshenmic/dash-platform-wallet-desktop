export class API {
  private static get api() {
    return window.electronAPI
  }

  static async createWallet(seedphrase: string, network: string, password: string) {
    return this.api.createWallet(seedphrase, network, password)
  }

  static async getAddresses(walletId: string) {
    return this.api.getAddresses(walletId)
  }

  static async getStatus() {
    return this.api.getStatus()
  }

  static async getAllWallets() {
    return this.api.getAllWallets()
  }

  static async getTransactions(walletId: string) {
    return this.api.getTransactions(walletId)
  }

  static async getTransactionByHash(hash: string, network: string) {
    return this.api.getTransactionByHash(hash, network)
  }

  static async getBlockByHash(hash: string, network: string) {
    return this.api.getBlockByHash(hash, network)
  }

  static async getBalance(address: string | string[], network: string) {
    return this.api.getBalance(address, network)
  }

  static async getIdentities(walletId: string) {
    return this.api.getIdentities(walletId)
  }

  static async getIdentityBalance(identifier: string) {
    return this.api.getIdentityBalance(identifier)
  }

  static async getIdentityNonce(identifier: string) {
    return this.api.getIdentityNonce(identifier)
  }

  static async deleteWallet(walletId: string) {
    return this.api.deleteWallet(walletId)
  }

  static async selectWallet(walletId: string) {
    return this.api.selectWallet(walletId)
  }

  static async getWalletBalance(walletId: string) {
    return this.api.getWalletBalance(walletId)
  }

  static async setAddressLabel(walletId: string, address: string, label: string) {
    return this.api.setAddressLabel(walletId, address, label)
  }
}
