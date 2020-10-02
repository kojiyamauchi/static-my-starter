/*
 AppGlobal.ts
*/

// Import Modules.
import GlobalModule1 from '@/Modules/Globals/Module1'
import GlobalModule2 from '@/Modules/Globals/Module2'

export default class AppGlobal {
  // Types.
  private readonly globalModule1: GlobalModule1
  private readonly globalModule2: GlobalModule2

  public constructor() {
    this.globalModule1 = new GlobalModule1('Global Module1!')
    this.globalModule2 = new GlobalModule2('Global Module2!')
  }

  public init(): void {
    this.globalModule1.core()
    this.globalModule2.core()
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
