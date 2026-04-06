import {Address} from "./Address";

export interface GroupedAddresses {
  receiving: Address[],
  change: Address[],
}
