import {IpcMainInvokeEvent} from 'electron/utility'
import {SpvService} from '../../services/SpvService'

export class StopSpvSyncHandler {
  private spvService: SpvService

  constructor(spvService: SpvService) {
    this.spvService = spvService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<void> => {
    this.spvService.stopSync()
  }
}