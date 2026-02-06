import type {
  BffListPlanEventsRequest,
  BffListPlanEventsResponse,
  BffPlanEventDetailResponse,
  BffCreatePlanEventRequest,
  BffUpdatePlanEventRequest,
  BffDuplicatePlanEventRequest,
  BffPlanEventResponse,
  BffBudgetGridRequest,
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffUpdateCellRequest,
  BffUpdateCellResponse,
  BffUpdateCellsRequest,
  BffUpdateCellsResponse,
  BffBudgetCompareRequest,
  BffBudgetCompareResponse,
  BffListBudgetAllocationEventsResponse,
  BffExecuteBudgetAllocationRequest,
  BffExecuteBudgetAllocationResponse,
  BffBudgetAllocationStatus,
  BffBudgetAllocationResultResponse,
} from "@epm/contracts/bff/budget-entry"

export interface BffClient {
  // Event CRUD
  listEvents(request: BffListPlanEventsRequest): Promise<BffListPlanEventsResponse>
  getEventDetail(eventId: string): Promise<BffPlanEventDetailResponse>
  createEvent(request: BffCreatePlanEventRequest): Promise<BffPlanEventResponse>
  updateEvent(eventId: string, request: BffUpdatePlanEventRequest): Promise<BffPlanEventResponse>
  duplicateEvent(eventId: string, request: BffDuplicatePlanEventRequest): Promise<BffPlanEventResponse>
  deleteEvent(eventId: string): Promise<void>

  // Grid operations
  getGrid(request: BffBudgetGridRequest): Promise<BffBudgetGridResponse>
  getContext(): Promise<BffBudgetContextResponse>
  updateCell(eventId: string, versionId: string, request: BffUpdateCellRequest): Promise<BffUpdateCellResponse>
  updateCells(eventId: string, versionId: string, request: BffUpdateCellsRequest): Promise<BffUpdateCellsResponse>
  getCompare(request: BffBudgetCompareRequest): Promise<BffBudgetCompareResponse>

  // Allocation operations
  listAllocationEvents(planEventId: string): Promise<BffListBudgetAllocationEventsResponse>
  executeAllocation(request: BffExecuteBudgetAllocationRequest): Promise<BffExecuteBudgetAllocationResponse>
  getAllocationStatus(planEventId: string): Promise<BffBudgetAllocationStatus>
  getAllocationResult(planEventId: string, planVersionId?: string): Promise<BffBudgetAllocationResultResponse>
}
