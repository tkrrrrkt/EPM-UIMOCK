/**
 * Error thrown when attempting to create a KPI event with duplicate event_code
 */
export class KpiMasterEventDuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KpiMasterEventDuplicateError';
  }
}
