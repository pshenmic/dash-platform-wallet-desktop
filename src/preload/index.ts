import { contextBridge, ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  saveWalletFromMnemonic: async (mnemonic: string, network: string) => ipcRenderer.invoke('saveWalletFromMnemonic', mnemonic, network),
  getWalletsByNetwork: async (network: string) => ipcRenderer.invoke('getWalletsByNetwork', network),
  getIdentifierFromWalletByIndex: async (walletId: string, identityIndex: number, keyIndex: number) => ipcRenderer.invoke('getIdentifierFromWalletByIndex', walletId, identityIndex, keyIndex)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('darkMode', {
      get: () => ipcRenderer.invoke('dark-mode:get'),
      system: () => ipcRenderer.invoke('dark-mode:system'),
      onChange: (callback: (isDark: boolean) => void) => {
        ipcRenderer.on('theme-changed', (_event, isDark) => callback(isDark))
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
