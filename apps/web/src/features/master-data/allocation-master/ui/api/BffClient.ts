import type {
  BffAllocationEventListRequest,
  BffAllocationEventListResponse,
  BffAllocationEventResponse,
  BffAllocationEventDetailResponse,
  BffCreateAllocationEventRequest,
  BffUpdateAllocationEventRequest,
  BffCopyAllocationEventRequest,
  BffCreateAllocationStepRequest,
  BffUpdateAllocationStepRequest,
  BffReorderStepsRequest,
  BffAllocationStepResponse,
  BffCreateAllocationTargetRequest,
  BffUpdateAllocationTargetRequest,
  BffAllocationTargetResponse,
  BffAllocationDriverListRequest,
  BffAllocationDriverListResponse,
  BffAllocationDriverResponse,
  BffCreateAllocationDriverRequest,
  BffUpdateAllocationDriverRequest,
} from '@epm/contracts/bff/allocation-master'

/**
 * BFF Client Interface
 * UI層からBFFへのAPI呼び出しを定義
 */
export interface BffClient {
  // Events
  listEvents(request: BffAllocationEventListRequest): Promise<BffAllocationEventListResponse>
  createEvent(request: BffCreateAllocationEventRequest): Promise<BffAllocationEventResponse>
  getEventDetail(id: string): Promise<BffAllocationEventDetailResponse>
  updateEvent(id: string, request: BffUpdateAllocationEventRequest): Promise<BffAllocationEventResponse>
  deleteEvent(id: string): Promise<void>
  copyEvent(id: string, request: BffCopyAllocationEventRequest): Promise<BffAllocationEventResponse>

  // Steps
  createStep(eventId: string, request: BffCreateAllocationStepRequest): Promise<BffAllocationStepResponse>
  updateStep(
    eventId: string,
    stepId: string,
    request: BffUpdateAllocationStepRequest,
  ): Promise<BffAllocationStepResponse>
  deleteStep(eventId: string, stepId: string): Promise<void>
  reorderSteps(eventId: string, request: BffReorderStepsRequest): Promise<BffAllocationStepResponse[]>

  // Targets
  createTarget(
    eventId: string,
    stepId: string,
    request: BffCreateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse>
  updateTarget(
    eventId: string,
    stepId: string,
    targetId: string,
    request: BffUpdateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse>
  deleteTarget(eventId: string, stepId: string, targetId: string): Promise<void>

  // Drivers
  listDrivers(request: BffAllocationDriverListRequest): Promise<BffAllocationDriverListResponse>
  createDriver(request: BffCreateAllocationDriverRequest): Promise<BffAllocationDriverResponse>
  getDriver(id: string): Promise<BffAllocationDriverResponse>
  updateDriver(id: string, request: BffUpdateAllocationDriverRequest): Promise<BffAllocationDriverResponse>
  deleteDriver(id: string): Promise<void>
}
