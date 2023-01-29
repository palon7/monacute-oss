export class NotEnoughMonacuteError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
