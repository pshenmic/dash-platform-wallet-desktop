export const apiDefinitions = (ipcRenderer) => ({
  createWallet: (seedphrase: string, network: string, password: string) => ipcRenderer.invoke('createWallet', seedphrase, network, password),
  getAddresses: (walletId: string) => ipcRenderer.invoke('getAddresses', walletId),
  getStatus: () => ipcRenderer.invoke('getStatus'),
  getAllWallets: () => ipcRenderer.invoke('getAllWallets'),
  getTransactions: (walletId: string) => ipcRenderer.invoke('getTransactions', walletId),
  getIdentities: (walletId: string) => ipcRenderer.invoke('getIdentities', walletId),
})
