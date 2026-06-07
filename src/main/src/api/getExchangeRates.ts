import { IpcMainInvokeEvent } from 'electron/utility'
import { RatesService, ExchangeRatesResult } from '../services/RatesService'

export class GetExchangeRatesHandler {
  private ratesService: RatesService

  constructor(ratesService: RatesService) {
    this.ratesService = ratesService
  }

  handle = async (_event: IpcMainInvokeEvent): Promise<ExchangeRatesResult> => {
    return this.ratesService.getRates()
  }
}
