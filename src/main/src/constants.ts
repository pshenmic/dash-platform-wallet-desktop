export const HOME_FOLDER_NAME = '.dash-platform-wallet'
export const HomeFolderName = '.dash-platform-wallet'
export const StorageFilename = 'storage.db'
export const ChainStorageFilename = 'ChainStorage'

export const PreferencesFilename = 'preferences.json'

export const PBKDF2_KEY_LENGTH = 32
export const PBKDF2_DIGEST = 'sha512'
export const PBKDF2_SALT_LENGTH = 32
export const PBKDF2_TARGET_MS = 200

export const SUPPORTED_LANGUAGES = [
  "en",
]

export const SUPPORTED_CURRENCIES = [
  "usd",
  "btc",
  "rub"
]

export const SEQUENCE_FINAL = 0xffffffff

// Dash base58 address version prefixes (the first decoded byte). Used to
// detect the recipient script type (P2PKH vs P2SH) and to confirm the
// address belongs to the wallet's network before building an output.
export const ADDRESS_PREFIX: Record<'mainnet' | 'testnet', {p2pkh: number; p2sh: number}> = {
  mainnet: {p2pkh: 76, p2sh: 16},
  testnet: {p2pkh: 140, p2sh: 19},
}

// Fixed serialized overhead of a transaction excluding inputs and outputs
// (version+type 4 B, input/output varint counts ~2 B, nLockTime 4 B). Used
// by the miner-fee estimate; the per-input and per-output sizes come from
// the SDK's own constants.
export const TX_BASE_OVERHEAD_SIZE = 10
