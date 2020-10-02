/*
 AppCore.ts
*/

// Import Modules.
import CommonModule from '@/Modules/Commons/Module'
import PrivateModule from '@/Modules/Privates/Module'

export default class AppCore {
  // Types.
  private readonly commonModule: CommonModule
  private readonly privateModule: PrivateModule

  public constructor() {
    this.commonModule = new CommonModule('Common Module!')
    this.privateModule = new PrivateModule('Private Module!')
  }

  public init(): void {
    this.commonModule.core()
    this.privateModule.core()
  }

  public domContentLoaded(): void {
    // Add DOM Content Loaded Method.
  }

  public load(): void {
    // Add Load Method.
  }

  public resize(): void {
    // Add Resize Method.
  }

  public scroll(): void {
    // Add Scroll Method.
  }
}
