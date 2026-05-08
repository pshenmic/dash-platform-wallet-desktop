import {IpcMainInvokeEvent} from 'electron/utility'
import {SpvService} from '../../services/SpvService'
import {SpvUtxoSummary} from '../../../spv/messages'

export class GetUtxosHandler {
  private spvService: SpvService

  constructor(spvService: SpvService) {
    this.spvService = spvService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<SpvUtxoSummary[]> => {
    return this.spvService.getUtxos()
  }
}