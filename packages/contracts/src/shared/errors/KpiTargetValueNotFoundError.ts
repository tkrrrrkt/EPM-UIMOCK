export class KpiTargetValueNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KpiTargetValueNotFoundError';
  }
}
