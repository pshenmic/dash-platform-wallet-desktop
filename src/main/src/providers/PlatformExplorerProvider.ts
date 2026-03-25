import {PlatformProvider} from "./PlatformProvider";
import {Network} from "../types";
import {IdentityPlatformProviderJSON} from "./types";

const BASE_URLS: Record<Network, string> = {
  mainnet: 'https://platform-explorer.pshenmic.dev',
  testnet: 'https://testnet.platform-explorer.pshenmic.dev'
}

export class PlatformExplorerProvider implements PlatformProvider {
  private baseUrl: string

  constructor(network: Network) {
    this.baseUrl = BASE_URLS[network]
  }

  async sendRequest(url: string, params?: RequestInit): Promise<Response> {
    const response = await fetch(url, params)

    if (!response.ok) {
      throw new Error(`PlatformExplorer API error: ${response.status}`)
    }

    return response
  }

  async getIdentity(identifier: string): Promise<IdentityPlatformProviderJSON> {
    const response = await this.sendRequest(`${this.baseUrl}/identity/${identifier}`)

    return await response.json() as IdentityPlatformProviderJSON
  }
}
