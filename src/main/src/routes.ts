import { ipcMain } from 'electron'

export default (walletController) => {
  const routes = [
    {
      name: 'saveWalletFromMnemonic',
      fn: walletController.saveWalletFromMnemonic
    },
    {
      name: 'getWalletsByNetwork',
      fn: walletController.getWalletsByNetwork
    },
    {
      name: 'getIdentifierFromWalletByIndex',
      fn: walletController.getIdentifierFromWalletByIndex
    }
  ]

  for (const route of routes) {
    ipcMain.handle(route.name, route.fn)
  }
}
