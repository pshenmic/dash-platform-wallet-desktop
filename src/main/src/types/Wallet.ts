import {Network} from "./index";

export class Wallet {
  walletId: string
  network: Network
  label: string
  encryptedMnemonic: string

  constructor (walletId: string, network: Network, label: string, encryptedMnemonic: string) {
    this.walletId = walletId
    this.network = network
    this.label = label
    this.encryptedMnemonic = encryptedMnemonic
  }

  // eslint-disable-next-line
  static fromRow ({ wallet_id, label, network, encrypted_mnemonic }) {
    return new Wallet(wallet_id, network, label, encrypted_mnemonic)
  }
}
