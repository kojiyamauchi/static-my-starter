/*
 Global Module2.ts
*/

// Import Modules.
// Add Path Here.

export default class Module2 {
  // Types.
  private readonly letter: string

  public constructor(arg: string) {
    // Add Constructor.
    this.letter = arg
  }

  public core(): void {
    console.info(this.letter)
  }
}
