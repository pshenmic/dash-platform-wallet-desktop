import {createCipheriv, randomBytes, scryptSync} from 'crypto'
import {DashPlatformSDK} from 'dash-platform-sdk'
import {TransactionJSON} from 'dash-core-sdk/src/types.js'
import {WalletDAO} from '../database/WalletDAO'
import {AddressDAO} from '../database/AddressDAO'
import {IdentityDAO} from '../database/IdentityDAO'
import {InsightWalletProvider} from '../providers/InsightWalletProvider'
import {Network} from '../types'
import {Address} from '../types/Address'
import {Identity, IdentityInfo} from '../types/Identity'
import {Wallet} from '../types/Wallet'
import {PrivateKeyWASM} from 'pshenmic-dpp'
import {TransactionWalletProviderJSON} from "../providers/types";
import {BlockJSON} from "dash-core-sdk/src/types";

const ADDRESS_LOOKAHEAD = 20
const IDENTITY_LOOKAHEAD = 10
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
  private identityDAO: IdentityDAO
  private sdk: DashPlatformSDK

  constructor(walletDAO: WalletDAO, addressDAO: AddressDAO, identityDAO: IdentityDAO, sdk: DashPlatformSDK) {
    this.walletDAO = walletDAO
    this.addressDAO = addressDAO
    this.identityDAO = identityDAO
    this.sdk = sdk
  }

  async createWallet(seedphrase: string, network: Network, password: string): Promise<string> {
    if (seedphrase.trim().split(/\s+/).length !== 12) {
      throw new Error('Seedphrase must be 12 words')
    }

    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const walletId = randomBytes(4).toString('hex')
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

    const identities: Identity[] = []

    for (let i = 0; i < IDENTITY_LOOKAHEAD; i++) {
      const key = this.sdk.keyPair.deriveIdentityPrivateKey(hdKey, i, 0, network)
      if (!key.publicKey) throw new Error(`Failed to derive identity public key at index ${i}`)

      const pkh = PrivateKeyWASM.fromBytes(key.privateKey as Uint8Array, network).getPublicKeyHash()

      let uniqueIdentity

      try {
        uniqueIdentity = await this.sdk.identities.getIdentityByPublicKeyHash(pkh)
      } catch {
        console.log(`Failed to fetch unique identity for publicKeyHash ${pkh}`)
      }

      let nonUniqueIdentity

      try {
        nonUniqueIdentity = await this.sdk.identities.getIdentityByNonUniquePublicKeyHash(pkh)
      } catch {
        console.log(`Failed to fetch non unique identity for publicKeyHash ${pkh}`)
      }

      if(nonUniqueIdentity != null || uniqueIdentity != null) {
        const identifier: string = (uniqueIdentity??nonUniqueIdentity).id.base58()

        identities.push({
          walletId,
          identityIndex: i,
          derivationPath: `m/9'/${coinType}'/0'/0/${i}`,
          identifier})
      }
    }

    await this.identityDAO.insertIdentities(identities)

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

  async getTransactions(walletId: string): Promise<TransactionWalletProviderJSON[]> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const addresses = await this.addressDAO.getAddressesByWalletId(walletId)
    const provider = new InsightWalletProvider(wallet.network)
    const txArrays = await Promise.all(addresses.map(a => provider.getTransactions(a.address)))

    return txArrays.flat()
  }

  async getTransactionByHash(hash: string, network: Network): Promise<TransactionJSON> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const provider = new InsightWalletProvider(network)

    const transaction = await provider.getTransactionByHash(hash)

    return transaction.toJSON()
  }

  async getBlockByHash(hash: string, network: Network): Promise<BlockJSON> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const provider = new InsightWalletProvider(network)

    const block = await provider.getBlockByHash(hash)

    return block.toJSON()
  }

  async getBalance(address: string | string[], network: Network): Promise<bigint> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const provider = new InsightWalletProvider(network)

    return await provider.getBalance(address)
  }

  async getIdentities(walletId: string): Promise<IdentityInfo[]> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    this.sdk.setNetwork(wallet.network)

    const stored = await this.identityDAO.getIdentitiesByWalletId(walletId)
    const results: IdentityInfo[] = []

    for (const entry of stored) {
      try {
        const identity = await this.sdk.identities.getIdentityByIdentifier(entry.identifier)
        results.push({
          identityIndex: entry.identityIndex,
          identifier: identity.id.base58(),
          balance: identity.balance.toString(),
          derivationPath: entry.derivationPath
        })
      } catch {
        // identity not registered on platform yet, skip
      }
    }

    return results
  }

  async getIdentityBalance(identifier: string): Promise<bigint> {
    return this.sdk.identities.getIdentityBalance(identifier)
  }

  async getIdentityNonce(identifier: string): Promise<bigint> {
    return this.sdk.identities.getIdentityNonce(identifier)
  }
}
