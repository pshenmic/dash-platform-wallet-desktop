import {IpcMainInvokeEvent} from 'electron/utility'
import {SpvService} from '../../services/SpvService'
import {SpvStatus} from '../../../spv/messages'

export class StartSpvSyncHandler {
  private spvService: SpvService

  constructor(spvService: SpvService) {
    this.spvService = spvService
  }

  handle = async (_event: IpcMainInvokeEvent, walletId: string): Promise<SpvStatus | null> => {
    return this.spvService.startSync(walletId)
  }
}