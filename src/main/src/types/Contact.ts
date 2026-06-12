import {Network} from './index'

export interface Contact {
  id: number
  label: string
  address: string
  network: Network
  createdAt: number
}
