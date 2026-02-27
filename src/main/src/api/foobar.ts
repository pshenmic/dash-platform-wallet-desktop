import {Event} from 'electron/main';
import { IpcMainInvokeEvent } from 'electron/utility';

export async function FoobarAPIHandler (event: IpcMainInvokeEvent, param2:string) {
  return 'bar' + param2
}
