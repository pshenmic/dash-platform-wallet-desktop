import {createCipheriv, randomBytes} from 'crypto'
import {DashPlatformSDK} from 'dash-platform-sdk'
import {WalletDAO} from '../database/WalletDAO'
import {AddressDAO} from '../database/AddressDAO'
import {IdentityDAO} from '../database/IdentityDAO'
import {TransactionDAO} from '../database/TransactionDAO'
import {ApplicationService} from './ApplicationService'
import {WalletProvider} from '../providers/WalletProvider'
import {InsightWalletProvider} from '../providers/InsightWalletProvider'
import {P2PWalletProvider} from '../providers/P2PWalletProvider'
import {Network} from '../types'
import {Address} from '../types/Address'
import {GroupedAddresses} from '../types/GroupedAddresses'
import {Identity, IdentityInfo} from '../types/Identity'
import {Wallet} from '../types/Wallet'
import {PrivateKeyWASM} from 'pshenmic-dpp'
import {
  Input,
  Output,
  PrivateKey,
  Transaction as SDKTransaction,
  utils as sdkUtils,
} from 'dash-core-sdk'
import {BlockJSON} from "dash-core-sdk/src/types";
import {QueryStatus} from "../types/QueryStatus";
import {WalletBalance} from "../types/WalletBalance";
import {Transaction} from "../types/Transaction";
import {UTXO} from "../types/UTXO";
import {deriveKeyFromPassword} from "../utils";
import {createDecipheriv} from "node:crypto";

const {addressToPublicKeyHash, publicKeyHashToAddress} = sdkUtils

const SEQUENCE_FINAL = 0xffffffff
// dash-core-sdk's NetworkLike uses capitalized enum keys; our app-wide
// Network is lowercase. Map at the boundary instead of widening Network.
const SDK_NETWORK: Record<Network, 'Mainnet' | 'Testnet'> = {mainnet: 'Mainnet', testnet: 'Testnet'}

const ADDRESS_LOOKAHEAD = 20
const IDENTITY_LOOKAHEAD = 10
const COIN_TYPE: Record<Network, number> = {mainnet: 5, testnet: 1}

function encryptMnemonic(mnemonic: string, password: string, iterations: number): string {
  const salt = randomBytes(32)
  const passwordKey = deriveKeyFromPassword(password, iterations, salt)

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', passwordKey, iv)
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const iterBuf = Buffer.alloc(4)
  iterBuf.writeUInt32BE(iterations)

  return Buffer.concat([iv, salt, iterBuf, ciphertext, tag]).toString('hex')
}

function decryptMnemonic(encryptedHex: string, password: string): string {
  const data = Buffer.from(encryptedHex, 'hex')

  const iv = data.slice(0, 12)
  const salt = data.slice(12, 44)
  const iterations = data.readUInt32BE(44)
  const tag = data.slice(data.length - 16)
  const ciphertext = data.slice(48, data.length - 16)

  const passwordKey = deriveKeyFromPassword(password, iterations, salt)

  const decipher = createDecipheriv('aes-256-gcm', passwordKey, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

export class WalletService {
  private walletDAO: WalletDAO
  private addressDAO: AddressDAO
  private identityDAO: IdentityDAO
  private transactionDAO: TransactionDAO
  private applicationService: ApplicationService
  private sdk: DashPlatformSDK
  private pbkdf2Iterations: number

  constructor(
    walletDAO: WalletDAO,
    addressDAO: AddressDAO,
    identityDAO: IdentityDAO,
    transactionDAO: TransactionDAO,
    applicationService: ApplicationService,
    sdk: DashPlatformSDK,
    pbkdf2Iterations: number,
  ) {
    this.pbkdf2Iterations = pbkdf2Iterations
    this.walletDAO = walletDAO
    this.addressDAO = addressDAO
    this.identityDAO = identityDAO
    this.transactionDAO = transactionDAO
    this.applicationService = applicationService
    this.sdk = sdk
  }

  private getProvider(walletId: string, network: Network): WalletProvider {
    if (this.applicationService.preferences.general.connectionType === 'p2p') {
      return new P2PWalletProvider(this.transactionDAO, walletId)
    }
    return new InsightWalletProvider(network, walletId, this.addressDAO)
  }

  async createWallet(seedphrase: string, network: Network, password: string): Promise<string> {
    if (seedphrase.trim().split(/\s+/).length !== 12) {
      throw new Error('Seedphrase must be 12 words')
    }

    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const walletId = randomBytes(4).toString('hex')
    const encryptedMnemonic = encryptMnemonic(seedphrase, password, this.pbkdf2Iterations)

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
      addresses.push({
        walletId,
        accountId,
        address,
        derivationPath: `m/44'/${coinType}'/${accountId}'/0/${i}`,
        index: i,
        isChange: false,
        isUsed: false,
        label: null
      })
    }

    for (let i = 0; i < ADDRESS_LOOKAHEAD; i++) {
      const key = await this.sdk.keyPair.derivePath(hdKey, `m/44'/${coinType}'/${accountId}'/1/${i}`)
      if (!key.publicKey) throw new Error(`Failed to derive public key at index ${i}`)
      const address = this.sdk.keyPair.p2pkhAddress(key.publicKey, network)
      addresses.push({
        walletId,
        accountId,
        address,
        derivationPath: `m/44'/${coinType}'/${accountId}'/1/${i}`,
        index: i,
        isChange: true,
        isUsed: false,
        label: null
      })
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

      if (nonUniqueIdentity != null || uniqueIdentity != null) {
        const identifier: string = (uniqueIdentity ?? nonUniqueIdentity).id.base58()

        identities.push({
          walletId,
          identityIndex: i,
          derivationPath: `m/9'/${coinType}'/0'/0/${i}`,
          identifier
        })
      }
    }

    if (identities.length > 0) {
      await this.identityDAO.insertIdentities(identities)
    }

    return walletId
  }

  async deleteWallet(walletId: string): Promise<QueryStatus> {
    return this.walletDAO.deleteWallet(walletId)
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

  async setSelectedWallet(walletId: string): Promise<QueryStatus> {
    return this.walletDAO.setSelectedWallet(walletId)
  }

  async verifyWalletPassword(walletId: string, password: string): Promise<boolean> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (wallet == null) {
      throw new Error('No selected wallet found')
    }

    const groupedAddresses = await this.addressDAO.getAddressesByWalletId(walletId)
    const [referenceWalletAddress] = [...groupedAddresses.change, ...groupedAddresses.receiving]

    let decryptedMnemonic: string

    try {
       decryptedMnemonic = decryptMnemonic(wallet.encryptedMnemonic, password)
    } catch {
      return false
    }

    const seed = this.sdk.keyPair.mnemonicToSeed(decryptedMnemonic)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, wallet.network)
    const coinType = COIN_TYPE[wallet.network]

    const key = await this.sdk.keyPair.derivePath(hdKey, `m/44'/${coinType}'/0'/1/${referenceWalletAddress.index}`)
    if (!key.publicKey) throw new Error(`Failed to derive public key at index ${referenceWalletAddress.index}`)

    const address = this.sdk.keyPair.p2pkhAddress(key.publicKey, wallet.network)

    return address === referenceWalletAddress.address;
  }

  async setAddressLabel(walletId: string, address: string, label: string): Promise<QueryStatus> {
    return this.addressDAO.setAddressLabel(walletId, address, label)
  }

  async getReceiveAddress(walletId: string): Promise<string> {
    const wallet = await this.walletDAO.getWalletById(walletId)
    if (wallet == null) throw new Error('Wallet not found')

    const provider = this.getProvider(wallet.walletId, wallet.network)
    return provider.nextUnusedAddress()
  }

  async getAddressesByWalletId(walletId: string): Promise<GroupedAddresses> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    const addresses = await this.addressDAO.getAddressesByWalletId(walletId)

    const provider = this.getProvider(wallet.walletId, wallet.network)

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

  async getTransactions(walletId: string): Promise<Transaction[]> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    const addresses = await this.addressDAO.getAddressesByWalletId(walletId)
    const allAddresses = [...addresses.change, ...addresses.receiving]
    const provider = this.getProvider(wallet.walletId, wallet.network)
    const txArrays = await Promise.all(allAddresses.map(a => provider.getTransactions(a.address)))

    return txArrays.flat().sort((a, b) => b?.date?.getTime() - a?.date?.getTime())
  }

  async getTransactionByHash(hash: string, network: Network): Promise<Transaction> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const wallet = await this.walletDAO.getSelectedWallet()

    if (wallet == null) {
      throw new Error('No selected wallet found')
    }

    const provider = this.getProvider(wallet.walletId, network)

    return provider.getTransactionByHash(hash)
  }

  async getBlockByHash(hash: string, network: Network): Promise<BlockJSON> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    // Routed via factory — throws Error('Unimplemented') in p2p mode.
    const wallet = await this.walletDAO.getSelectedWallet()
    if (wallet == null) {
      throw new Error('No selected wallet found')
    }
    const provider = this.getProvider(wallet.walletId, network)

    const block = await provider.getBlockByHash(hash)

    return block.toJSON()
  }

  async getWalletBalance(walletId: string): Promise<WalletBalance> {
    const wallet = await this.walletDAO.getWalletById(walletId)

    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    const walletAddresses = await this.addressDAO.getAddressesByWalletId(walletId)
    const addresses = [...walletAddresses.change, ...walletAddresses.receiving]

    const identities = await this.identityDAO.getIdentitiesByWalletId(walletId)

    const provider = this.getProvider(wallet.walletId, wallet.network)

    const addressesBalance = await provider.getBalance(addresses.map(addr => addr.address))

    const identitiesBalances = await Promise.all(identities.map(async identity => this.getIdentityBalance(identity.identifier)))
    const identitiesBalance = identitiesBalances.reduce((acc, curr) => acc + curr, BigInt(0))

    return {
      dash: {
        amount: addressesBalance,
        usdAmount: '0.0'
      },
      credits: {
        amount: identitiesBalance,
        usdAmount: '0.0'
      }
    }
  }

  async getBalance(address: string | string[], network: Network): Promise<bigint> {
    if (network !== 'mainnet' && network !== 'testnet') {
      throw new Error('Invalid network ("mainnet", "testnet")')
    }

    const wallet = await this.walletDAO.getSelectedWallet()
    if (wallet == null) {
      throw new Error('No selected wallet found')
    }
    const provider = this.getProvider(wallet.walletId, network)

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
        const [aliasDocument] = await this.sdk.names.searchByIdentity(entry.identifier)
        const {label, parentDomainName} = aliasDocument?.properties ?? {}

        let alias: string | null = null

        if (label != null && parentDomainName != null) {
          alias = `${label}.${parentDomainName}`
        }

        // TODO: Implement read usd amount
        results.push({
          identityIndex: entry.identityIndex,
          identifier: identity.id.base58(),
          alias,
          balance: {
            amount: BigInt(identity.balance),
            usdAmount: '0.0'
          },
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

  // Build, sign and broadcast a P2PKH transaction spending the wallet's
  // UTXOs to `toAddress`. amountSatoshis crosses IPC as a string because
  // BigInt is not IPC-serializable. Returns the broadcast txid.
  //
  // UTXOs are sourced through the connection-mode provider (P2P → SQL,
  // RPC → Insight). Broadcast always goes through Insight regardless of
  // mode — P2PWalletProvider.broadcastTx is not implemented yet.
  async sendCoins(
    walletId: string,
    toAddress: string,
    amountSatoshis: string,
    password: string,
  ): Promise<string> {
    const amount = BigInt(amountSatoshis)
    if (amount <= 0n) {
      throw new Error('Amount must be greater than 0')
    }

    const wallet = await this.walletDAO.getWalletById(walletId)
    if (wallet == null) {
      throw new Error('Wallet not found')
    }

    this.assertAddressOnNetwork(toAddress, wallet.network)

    let mnemonic: string
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, password)
    } catch {
      throw new Error('Invalid password')
    }

    const grouped = await this.addressDAO.getAddressesByWalletId(walletId)
    const allAddresses = [...grouped.receiving, ...grouped.change]
    if (allAddresses.length === 0) {
      throw new Error('Wallet has no addresses')
    }

    const provider = this.getProvider(wallet.walletId, wallet.network)

    const utxosWithMeta = await this.collectUtxos(provider, allAddresses)
    if (utxosWithMeta.length === 0) {
      throw new Error('Insufficient funds')
    }

    const selected = this.selectUtxosGreedy(utxosWithMeta, amount)
    if (selected.totalIn < amount) {
      throw new Error('Insufficient funds')
    }

    const changeAddress = this.pickChangeAddress(grouped.change)

    const tx = this.buildTransaction(selected.utxos, toAddress, amount, changeAddress, selected.totalIn)

    const seed = this.sdk.keyPair.mnemonicToSeed(mnemonic)
    const hdKey = this.sdk.keyPair.seedToHdKey(seed, wallet.network)

    const privateKeys = await Promise.all(
      selected.utxos.map(async u => {
        const derived = await this.sdk.keyPair.derivePath(hdKey, u.address.derivationPath)
        if (!derived.privateKey) {
          throw new Error(`Failed to derive private key for ${u.address.address}`)
        }
        return PrivateKey.fromBytes(derived.privateKey, SDK_NETWORK[wallet.network], true)
      })
    )

    this.signTransactionMultiKey(tx, privateKeys)

    const broadcaster = new InsightWalletProvider(wallet.network, wallet.walletId, this.addressDAO)
    return broadcaster.broadcastTx(tx)
  }

  private assertAddressOnNetwork(address: string, network: Network): void {
    let pkh: Uint8Array
    try {
      pkh = addressToPublicKeyHash(address)
    } catch {
      throw new Error('Invalid recipient address')
    }
    const roundTrip = publicKeyHashToAddress(pkh, SDK_NETWORK[network])
    if (roundTrip !== address) {
      throw new Error(`Recipient address is not a valid ${network} address`)
    }
  }

  private async collectUtxos(
    provider: WalletProvider,
    addresses: Address[],
  ): Promise<{utxo: UTXO; address: Address}[]> {
    const perAddress = await Promise.all(
      addresses.map(async addr => ({
        addr,
        utxos: await provider.getUTXOs(addr.address),
      }))
    )
    return perAddress.flatMap(({addr, utxos}) =>
      utxos.map(utxo => ({utxo, address: addr}))
    )
  }

  // Greedy largest-first. Stops once the accumulated input amount covers
  // `target + a generous fee headroom`. Fee math is deferred to
  // SDKTransaction.generateChange, which throws on real shortfall.
  private selectUtxosGreedy(
    candidates: {utxo: UTXO; address: Address}[],
    target: bigint,
  ): {utxos: {utxo: UTXO; address: Address}[]; totalIn: bigint} {
    const sorted = [...candidates].sort((a, b) =>
      a.utxo.satoshis > b.utxo.satoshis ? -1 : a.utxo.satoshis < b.utxo.satoshis ? 1 : 0
    )
    const picked: {utxo: UTXO; address: Address}[] = []
    let totalIn = 0n
    // Headroom: covers signed inputs + change output + recipient output + tx overhead at FEE_PER_BYTE=1.
    const feeHeadroom = (n: number): bigint => BigInt(n * 150 + 100)
    for (const c of sorted) {
      picked.push(c)
      totalIn += c.utxo.satoshis
      if (totalIn >= target + feeHeadroom(picked.length)) break
    }
    return {utxos: picked, totalIn}
  }

  private pickChangeAddress(change: Address[]): string {
    if (change.length === 0) {
      throw new Error('Wallet has no change addresses')
    }
    const unused = change.find(a => !a.isUsed)
    return (unused ?? change[0]).address
  }

  private buildTransaction(
    selected: {utxo: UTXO; address: Address}[],
    toAddress: string,
    amount: bigint,
    changeAddress: string,
    totalIn: bigint,
  ): SDKTransaction {
    const inputs = selected.map(({utxo}) => new Input(utxo.txId, utxo.vOut, utxo.script, SEQUENCE_FINAL))

    const recipientOutput = new Output(amount)
    recipientOutput.generateP2PKH(toAddress)

    const tx = new SDKTransaction(inputs, [recipientOutput])
    // generateChange computes fee internally (FEE_PER_BYTE) and only appends
    // a change output when worthwhile. Throws if totalIn < amount.
    tx.generateChange(changeAddress, totalIn)
    return tx
  }

  // Multi-key P2PKH signing. The SDK's tx.sign(privateKey) signs every input
  // with the same key — useless for an HD wallet whose UTXOs come from
  // different addresses. For each input i we clone the unsigned tx, call
  // sign(privKey[i]) on the clone (which produces a correct signature for
  // input i with the right key, wrong for others), then splice clone.inputs[i]
  // .scriptSig into the final tx. This delegates the secp256k1 / sighash
  // crypto to the SDK while still producing per-input correct signatures.
  private signTransactionMultiKey(tx: SDKTransaction, privateKeys: PrivateKey[]): void {
    if (tx.inputs.length !== privateKeys.length) {
      throw new Error('Input/key count mismatch')
    }
    const unsignedBytes = tx.bytes()
    for (let i = 0; i < tx.inputs.length; i++) {
      const clone = SDKTransaction.fromBytes(unsignedBytes)
      clone.sign(privateKeys[i])
      tx.inputs[i].scriptSig = clone.inputs[i].scriptSig
    }
  }
}

