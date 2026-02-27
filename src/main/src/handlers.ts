import { FoobarAPIHandler } from "./api/foobar";
import { ipcMain } from "electron/main";

export default {
  init: () => {
    ipcMain.handle('foobar', FoobarAPIHandler)
  }
}
