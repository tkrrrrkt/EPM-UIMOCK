export class ActionPlanInvalidReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionPlanInvalidReferenceError';
  }
}
