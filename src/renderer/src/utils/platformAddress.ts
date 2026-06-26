import { AddressNetwork } from './address'

const PREFIX: Record<AddressNetwork, string> = {
  mainnet: 'dash1',
  testnet: 'tdash1',
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

export function isValidPlatformAddress(address: string, network?: AddressNetwork): boolean {
  const a = address.trim()
  if (a.length === 0 || a !== a.toLowerCase()) return false

  const prefixes = network ? [PREFIX[network]] : Object.values(PREFIX)
  const prefix = prefixes.find((p) => a.startsWith(p))
  if (prefix == null) return false

  const data = a.slice(prefix.length)
  if (data.length < 6) return false
  for (const ch of data) {
    if (!BECH32_CHARSET.includes(ch)) return false
  }
  return true
}
