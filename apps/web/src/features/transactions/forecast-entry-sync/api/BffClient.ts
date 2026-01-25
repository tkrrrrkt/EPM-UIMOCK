import type {
  BffForecastGridRequest,
  BffForecastGridResponse,
  BffForecastContextResponse,
  BffUpdateForecastCellRequest,
  BffUpdateForecastCellResponse,
  BffUpdateForecastCellsRequest,
  BffUpdateForecastCellsResponse,
  BffForecastBudgetCompareRequest,
  BffForecastBudgetCompareResponse,
  BffForecastPreviousCompareRequest,
  BffForecastPreviousCompareResponse,
  BffListForecastEventsRequest,
  BffListForecastEventsResponse,
  BffCreateForecastEventRequest,
  BffForecastEventResponse,
  BffForecastEventDetailResponse,
  BffUpdateForecastEventRequest,
  BffCreateForecastVersionRequest,
  BffForecastVersionSummary,
  BffSubjectListResponse,
} from "@epm/contracts/bff/forecast-entry"

export interface ForecastBffClient {
  // Event management
  listEvents(request: BffListForecastEventsRequest): Promise<BffListForecastEventsResponse>
  getEvent(eventId: string): Promise<BffForecastEventDetailResponse>
  createEvent(request: BffCreateForecastEventRequest): Promise<BffForecastEventResponse>
  updateEvent(eventId: string, request: BffUpdateForecastEventRequest): Promise<BffForecastEventResponse>
  deleteEvent(eventId: string): Promise<void>
  duplicateEvent(eventId: string, newEventCode: string, newEventName: string): Promise<BffForecastEventResponse>

  // Version management
  createVersion(eventId: string, request: BffCreateForecastVersionRequest): Promise<BffForecastVersionSummary>

  // Grid operations
  getGrid(request: BffForecastGridRequest): Promise<BffForecastGridResponse>
  getContext(): Promise<BffForecastContextResponse>
  updateCell(
    gridRequest: BffForecastGridRequest,
    cellRequest: BffUpdateForecastCellRequest
  ): Promise<BffUpdateForecastCellResponse>
  updateCells(
    gridRequest: BffForecastGridRequest,
    cellsRequest: BffUpdateForecastCellsRequest
  ): Promise<BffUpdateForecastCellsResponse>

  // Comparison
  getBudgetCompare(request: BffForecastBudgetCompareRequest): Promise<BffForecastBudgetCompareResponse>
  getPreviousCompare(request: BffForecastPreviousCompareRequest): Promise<BffForecastPreviousCompareResponse>

  // Master data
  getSubjects(): Promise<BffSubjectListResponse>
}
