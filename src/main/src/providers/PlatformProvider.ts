import {IdentityPlatformProviderJSON} from "./types";

export interface PlatformProvider {
  getIdentity(identifier: string): Promise<IdentityPlatformProviderJSON>
}
