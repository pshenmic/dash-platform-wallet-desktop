export const apiDefinitions = (ipcRenderer) =>({
  foobar: (param: string) => ipcRenderer.invoke('foobar', param),
  saveWalletFromMnemonic: async (mnemonic: string, network: string) => ipcRenderer.invoke('saveWalletFromMnemonic', mnemonic, network),
  getWalletsByNetwork: async (network: string) => ipcRenderer.invoke('getWalletsByNetwork', network),
  getIdentifierFromWalletByIndex: async (walletId: string, identityIndex: number, keyIndex: number) => ipcRenderer.invoke('getIdentifierFromWalletByIndex', walletId, identityIndex, keyIndex)
})
