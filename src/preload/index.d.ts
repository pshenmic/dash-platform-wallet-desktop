import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: {
      createWallet: (seedphrase: string, network: string, password: string) => Promise<unknown>
      getAddresses: (walletId: string) => Promise<unknown>
      getStatus: () => Promise<unknown>
      getAllWallets: () => Promise<unknown>
      foobar: (arg: string) => Promise<unknown>
    }
    darkMode: {
      get: () => Promise<boolean>
      system: () => Promise<void>
      onChange: (callback: (isDark: boolean) => void) => void
    }
  }
}
