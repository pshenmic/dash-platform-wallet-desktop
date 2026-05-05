import {IpcMainInvokeEvent} from 'electron/utility'
import {SpvService} from '../../services/SpvService'
import {SpvStatus} from '../../../spv/messages'

export class GetSpvStatusHandler {
  private spvService: SpvService

  constructor(spvService: SpvService) {
    this.spvService = spvService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<SpvStatus | null> => {
    return this.spvService.getStatus()
  }
}