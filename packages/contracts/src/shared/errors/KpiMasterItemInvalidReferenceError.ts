export class KpiMasterItemInvalidReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KpiMasterItemInvalidReferenceError';
  }
}
