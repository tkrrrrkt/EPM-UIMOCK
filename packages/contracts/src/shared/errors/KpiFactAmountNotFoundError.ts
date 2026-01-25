export class KpiFactAmountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KpiFactAmountNotFoundError';
  }
}
