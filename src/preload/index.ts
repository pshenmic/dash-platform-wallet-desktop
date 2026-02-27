import { contextBridge, ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {apiDefinitions} from './definitions'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', apiDefinitions(ipcRenderer))
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
