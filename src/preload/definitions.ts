export const apiDefinitions = (ipcRenderer) => ({
  createWallet: (seedphrase: string, network: string, password: string) => ipcRenderer.invoke('createWallet', seedphrase, network, password),
  getAddresses: (walletId: string) => ipcRenderer.invoke('getAddresses', walletId),
  getStatus: () => ipcRenderer.invoke('getStatus'),
  getAllWallets: () => ipcRenderer.invoke('getAllWallets'),
  getTransactions: (walletId: string) => ipcRenderer.invoke('getTransactions', walletId),
  getTransactionByHash: (hash: string, network: string) => ipcRenderer.invoke('getTransactionByHash', hash, network),
  getBlockByHash: (hash: string, network: string) => ipcRenderer.invoke('getBlockByHash', hash, network),
  getIdentities: (walletId: string) => ipcRenderer.invoke('getIdentities', walletId),
  getIdentityBalance: (identifier: string): Promise<bigint> => ipcRenderer.invoke('getIdentityBalance', identifier),
  getIdentityNonce: (identifier: string): Promise<bigint> => ipcRenderer.invoke('getIdentityNonce', identifier),
})
