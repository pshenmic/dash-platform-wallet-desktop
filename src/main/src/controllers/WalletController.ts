import { WalletDAO } from '../dao/WalletDAO'
import {DashPlatformSDK} from "dash-platform-sdk";

export class WalletController {
  knex
  sdk: DashPlatformSDK
  walletDAO: WalletDAO

  constructor (knex, sdk: DashPlatformSDK) {
    this.knex = knex
    this.sdk = sdk
    this.walletDAO = new WalletDAO(knex)
  }

  saveWalletFromMnemonic = async (_event, mnemonic, network) => {
    if (mnemonic.split(' ').length !== 12) {
      throw new Error('Mnemonic must be 12 characters long')
    }

    const walletIdBytes = new Uint8Array([0, 0].map(() => Math.floor((Math.random() + 1) * 255)))

    const walletId = this.sdk.utils.bytesToHex(walletIdBytes)

    await this.walletDAO.saveWallet(mnemonic, walletId, network, null)
  }

  getWalletsByNetwork = async (_event, network) => {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('invalid network ("mainnet", "testnet")')
    }

    return this.walletDAO.getWalletsByNetwork(network)
  }

  getIdentifierFromWalletByIndex = async (_event, walletId, identityIndex, keyIndex) => {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found.')
    }

    const seed = this.sdk.keyPair.mnemonicToSeed(wallet.encryptedMnemonic)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, wallet.network)
    const identityKey = this.sdk.keyPair.deriveIdentityPrivateKey(hdKey, identityIndex, keyIndex, wallet.network)

    if (identityKey.privateKey == null) {
      throw new Error('Identity private key could not be derived')
    }

    return this.sdk.utils.bytesToHex(identityKey.privateKey)
  }
}
