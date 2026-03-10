import { randomBytes, scryptSync, createCipheriv } from 'crypto'
import { DashPlatformSDK } from 'dash-platform-sdk'
import { WalletDAO } from '../database/WalletDAO'
import { AddressDAO } from '../database/AddressDAO'
import { Network } from '../types'
import { Address } from '../types/Address'
import { Wallet } from '../types/Wallet'

const ADDRESS_LOOKAHEAD = 20
const COIN_TYPE: Record<Network, number> = { mainnet: 5, testnet: 1 }

function encryptMnemonic(mnemonic: string, password: string): string {
  const salt = randomBytes(32)
  const iv = randomBytes(12)
  const key = scryptSync(password, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, salt, ciphertext, tag]).toString('hex')
}

export class WalletService {
  private walletDAO: WalletDAO
  private addressDAO: AddressDAO
  private sdk: DashPlatformSDK

  constructor(walletDAO: WalletDAO, addressDAO: AddressDAO, sdk: DashPlatformSDK) {
    this.walletDAO = walletDAO
    this.addressDAO = addressDAO
    this.sdk = sdk
  }

  async createWallet(seedphrase: string, network: Network, password: string): Promise<string> {
    if (seedphrase.trim().split(/\s+/).length !== 12) {
      throw new Error('Seedphrase must be 12 words')
    }

    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const walletId = randomBytes(16).toString('hex')
    const encryptedMnemonic = encryptMnemonic(seedphrase, password)

    await this.walletDAO.saveWallet(encryptedMnemonic, walletId, network, null)

    const seed = this.sdk.keyPair.mnemonicToSeed(seedphrase)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, network)
    const coinType = COIN_TYPE[network]
    const accountId = 0

    const addresses: Address[] = []

    for (let i = 0; i < ADDRESS_LOOKAHEAD; i++) {
      const key = await this.sdk.keyPair.derivePath(hdKey, `m/44'/${coinType}'/${accountId}'/0/${i}`)
      if (!key.publicKey) throw new Error(`Failed to derive public key at index ${i}`)
      const address = this.sdk.keyPair.p2pkhAddress(key.publicKey, network)
      addresses.push({ walletId, accountId, address, derivationPath: `m/44'/${coinType}'/${accountId}'/0/${i}`, index: i, isChange: false })
    }

    for (let i = 0; i < ADDRESS_LOOKAHEAD; i++) {
      const key = await this.sdk.keyPair.derivePath(hdKey, `m/44'/${coinType}'/${accountId}'/1/${i}`)
      if (!key.publicKey) throw new Error(`Failed to derive public key at index ${i}`)
      const address = this.sdk.keyPair.p2pkhAddress(key.publicKey, network)
      addresses.push({ walletId, accountId, address, derivationPath: `m/44'/${coinType}'/${accountId}'/1/${i}`, index: i, isChange: true })
    }

    await this.addressDAO.insertAddresses(addresses)

    return walletId
  }

  async getAllWallets(): Promise<Wallet[]> {
    return this.walletDAO.getAllWallets()
  }

  async getWalletById(walletId: string): Promise<Wallet | null> {
    return this.walletDAO.getWalletById(walletId)
  }

  async getSelectedWallet(): Promise<Wallet | null> {
    return this.walletDAO.getSelectedWallet()
  }
}
