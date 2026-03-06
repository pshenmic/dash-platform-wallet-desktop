export const apiDefinitions = (ipcRenderer) => ({
  createWallet: (seedphrase: string, network: string, password: string) => ipcRenderer.invoke('createWallet', seedphrase, network, password),
  getWalletAddresses: (walletId: string) => ipcRenderer.invoke('getWalletAddresses', walletId),
  getStatus: () => ipcRenderer.invoke('getStatus'),
  getAllWallets: () => ipcRenderer.invoke('getAllWallets'),
})
