export class ApplicationService {
  private ready: boolean = false

  markReady(): void {
    this.ready = true
  }

  markNotReady(): void {
    this.ready = true
  }

  isReady(): boolean {
    return this.ready
  }
}
