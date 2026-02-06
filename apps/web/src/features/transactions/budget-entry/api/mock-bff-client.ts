import type { BffClient } from "./bff-client"
import type {
  BffListPlanEventsRequest,
  BffListPlanEventsResponse,
  BffPlanEventDetailResponse,
  BffCreatePlanEventRequest,
  BffUpdatePlanEventRequest,
  BffDuplicatePlanEventRequest,
  BffPlanEventResponse,
  BffPlanEventSummary,
  BffPlanVersionSummary,
  BffDepartmentSummary,
  BffBudgetGridRequest,
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffUpdateCellRequest,
  BffUpdateCellResponse,
  BffUpdateCellsRequest,
  BffUpdateCellsResponse,
  BffBudgetCompareRequest,
  BffBudgetCompareResponse,
  ScenarioType,
  PlanVersionStatus,
  BffBudgetAllocationEvent,
  BffListBudgetAllocationEventsResponse,
  BffExecuteBudgetAllocationRequest,
  BffExecuteBudgetAllocationResponse,
  BffBudgetAllocationStatus,
  BffBudgetAllocationResultResponse,
} from "@epm/contracts/bff/budget-entry"

// Mock data
const mockEvents: BffPlanEventSummary[] = [
  {
    id: "pe-001",
    eventCode: "FY2026_BUDGET_INIT",
    eventName: "FY2026 当初予算",
    scenarioType: "BUDGET",
    fiscalYear: 2026,
    versionCount: 2,
    latestVersionName: "第2回",
    latestVersionStatus: "DRAFT",
    updatedAt: "2026-01-10T09:00:00Z",
    allocationStatus: "NOT_EXECUTED",
    allocationExecutedAt: null,
    allocationExecutedBy: null,
  },
  {
    id: "pe-002",
    eventCode: "FY2026_FORECAST_01",
    eventName: "FY2026 1月見込",
    scenarioType: "FORECAST",
    fiscalYear: 2026,
    versionCount: 1,
    latestVersionName: "第1回",
    latestVersionStatus: "DRAFT",
    updatedAt: "2026-01-08T14:30:00Z",
    allocationStatus: "NOT_EXECUTED",
    allocationExecutedAt: null,
    allocationExecutedBy: null,
  },
  {
    id: "pe-003",
    eventCode: "FY2025_BUDGET_INIT",
    eventName: "FY2025 当初予算",
    scenarioType: "BUDGET",
    fiscalYear: 2025,
    versionCount: 3,
    latestVersionName: "FIXED",
    latestVersionStatus: "FIXED",
    updatedAt: "2025-04-01T10:00:00Z",
    allocationStatus: "EXECUTED",
    allocationExecutedAt: "2025-03-15T10:30:00Z",
    allocationExecutedBy: "経理部 山田太郎",
  },
  {
    id: "pe-004",
    eventCode: "FY2025_BUDGET_REV",
    eventName: "FY2025 修正予算",
    scenarioType: "BUDGET",
    fiscalYear: 2025,
    versionCount: 2,
    latestVersionName: "FIXED",
    latestVersionStatus: "FIXED",
    updatedAt: "2025-10-15T16:00:00Z",
    allocationStatus: "EXECUTED",
    allocationExecutedAt: "2025-10-10T14:00:00Z",
    allocationExecutedBy: "経理部 鈴木一郎",
  },
]

const mockVersions: BffPlanVersionSummary[] = [
  { id: "pv-001", versionNo: 1, versionCode: "V1", versionName: "第1回", status: "APPROVED", fixedAt: null },
  { id: "pv-002", versionNo: 2, versionCode: "V2", versionName: "第2回", status: "DRAFT", fixedAt: null },
]

const mockDepartments: BffDepartmentSummary[] = [
  { id: "dept-001", departmentCode: "SALES1", departmentName: "営業1課" },
  { id: "dept-002", departmentCode: "SALES2", departmentName: "営業2課" },
  { id: "dept-003", departmentCode: "DEV1", departmentName: "開発1課" },
  { id: "dept-004", departmentCode: "DEV2", departmentName: "開発2課" },
  { id: "dept-005", departmentCode: "ADMIN", departmentName: "管理部" },
]

// Mock allocation events for BUDGET scenario
const mockBudgetAllocationEvents: BffBudgetAllocationEvent[] = [
  {
    id: "ae-budget-001",
    eventCode: "BUDGET_ALLOC_001",
    eventName: "予算_間接費配賦",
    scenarioType: "BUDGET",
    executionOrder: 1,
    stepCount: 3,
    isActive: true,
  },
  {
    id: "ae-budget-002",
    eventCode: "BUDGET_ALLOC_002",
    eventName: "予算_製造間接費配賦",
    scenarioType: "BUDGET",
    executionOrder: 2,
    stepCount: 2,
    isActive: true,
  },
  {
    id: "ae-budget-003",
    eventCode: "BUDGET_ALLOC_003",
    eventName: "予算_本社経費配賦",
    scenarioType: "BUDGET",
    executionOrder: 3,
    stepCount: 4,
    isActive: false,
  },
]

// Mock allocation events for FORECAST scenario
const mockForecastAllocationEvents: BffBudgetAllocationEvent[] = [
  {
    id: "ae-forecast-001",
    eventCode: "FORECAST_ALLOC_001",
    eventName: "見込_間接費配賦",
    scenarioType: "FORECAST",
    executionOrder: 1,
    stepCount: 3,
    isActive: true,
  },
  {
    id: "ae-forecast-002",
    eventCode: "FORECAST_ALLOC_002",
    eventName: "見込_製造間接費配賦",
    scenarioType: "FORECAST",
    executionOrder: 2,
    stepCount: 2,
    isActive: true,
  },
]

export class MockBffClient implements BffClient {
  private events = [...mockEvents]

  async listEvents(request: BffListPlanEventsRequest): Promise<BffListPlanEventsResponse> {
    await this.delay(300)

    let filtered = [...this.events]

    if (request.scenarioType) {
      filtered = filtered.filter((e) => e.scenarioType === request.scenarioType)
    }

    if (request.fiscalYear) {
      filtered = filtered.filter((e) => e.fiscalYear === request.fiscalYear)
    }

    // Sort
    const sortBy = request.sortBy ?? "updatedAt"
    const sortOrder = request.sortOrder ?? "desc"
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof BffPlanEventSummary]
      const bVal = b[sortBy as keyof BffPlanEventSummary]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    const page = request.page ?? 1
    const pageSize = request.pageSize ?? 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      items: filtered.slice(start, end),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getEventDetail(eventId: string): Promise<BffPlanEventDetailResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    return {
      id: event.id,
      eventCode: event.eventCode,
      eventName: event.eventName,
      scenarioType: event.scenarioType,
      fiscalYear: event.fiscalYear,
      layoutId: "layout-001",
      layoutName: "標準PL",
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: event.updatedAt,
      versions: mockVersions,
      departments: mockDepartments,
    }
  }

  async createEvent(request: BffCreatePlanEventRequest): Promise<BffPlanEventResponse> {
    await this.delay(500)

    // Check duplicate
    if (this.events.some((e) => e.eventCode === request.eventCode)) {
      throw new Error("BUDGET_EVENT_CODE_DUPLICATE")
    }

    const newEvent: BffPlanEventSummary = {
      id: `pe-${Date.now()}`,
      eventCode: request.eventCode,
      eventName: request.eventName,
      scenarioType: request.scenarioType,
      fiscalYear: request.fiscalYear,
      versionCount: 1,
      latestVersionName: "第1回",
      latestVersionStatus: "DRAFT",
      updatedAt: new Date().toISOString(),
    }

    this.events.unshift(newEvent)

    return {
      id: newEvent.id,
      eventCode: newEvent.eventCode,
      eventName: newEvent.eventName,
      scenarioType: newEvent.scenarioType,
      fiscalYear: newEvent.fiscalYear,
      layoutId: request.layoutId,
      notes: request.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateEvent(eventId: string, request: BffUpdatePlanEventRequest): Promise<BffPlanEventResponse> {
    await this.delay(300)

    const index = this.events.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    const event = this.events[index]
    const updated: BffPlanEventSummary = {
      ...event,
      eventName: request.eventName ?? event.eventName,
      updatedAt: new Date().toISOString(),
    }
    this.events[index] = updated

    return {
      id: updated.id,
      eventCode: updated.eventCode,
      eventName: updated.eventName,
      scenarioType: updated.scenarioType,
      fiscalYear: updated.fiscalYear,
      layoutId: "layout-001",
      notes: request.notes ?? null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: updated.updatedAt,
    }
  }

  async duplicateEvent(eventId: string, request: BffDuplicatePlanEventRequest): Promise<BffPlanEventResponse> {
    await this.delay(500)

    const original = this.events.find((e) => e.id === eventId)
    if (!original) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    // Check duplicate
    if (this.events.some((e) => e.eventCode === request.newEventCode)) {
      throw new Error("BUDGET_EVENT_CODE_DUPLICATE")
    }

    const newEvent: BffPlanEventSummary = {
      id: `pe-${Date.now()}`,
      eventCode: request.newEventCode,
      eventName: request.newEventName,
      scenarioType: original.scenarioType,
      fiscalYear: original.fiscalYear,
      versionCount: 1,
      latestVersionName: "第1回",
      latestVersionStatus: "DRAFT",
      updatedAt: new Date().toISOString(),
    }

    this.events.unshift(newEvent)

    return {
      id: newEvent.id,
      eventCode: newEvent.eventCode,
      eventName: newEvent.eventName,
      scenarioType: newEvent.scenarioType,
      fiscalYear: newEvent.fiscalYear,
      layoutId: "layout-001",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    if (event.latestVersionStatus === "FIXED") {
      throw new Error("BUDGET_EVENT_HAS_FIXED_VERSION")
    }

    this.events = this.events.filter((e) => e.id !== eventId)
  }

  async getGrid(request: BffBudgetGridRequest): Promise<BffBudgetGridResponse> {
    await this.delay(300)
    // Stub - will be implemented in Phase 2
    throw new Error("Not implemented")
  }

  async getContext(): Promise<BffBudgetContextResponse> {
    await this.delay(300)
    return {
      fiscalYears: [
        { value: 2026, label: "FY2026" },
        { value: 2025, label: "FY2025" },
        { value: 2024, label: "FY2024" },
      ],
      departments: mockDepartments.map((d) => ({ id: d.id, code: d.departmentCode, name: d.departmentName })),
      planEvents: this.events.map((e) => ({
        id: e.id,
        code: e.eventCode,
        name: e.eventName,
        scenarioType: e.scenarioType,
      })),
      planVersions: mockVersions.map((v) => ({
        id: v.id,
        code: v.versionCode,
        name: v.versionName,
        status: v.status,
      })),
    }
  }

  async updateCell(
    eventId: string,
    versionId: string,
    request: BffUpdateCellRequest,
  ): Promise<BffUpdateCellResponse> {
    await this.delay(300)
    // Stub - will be implemented in Phase 2
    throw new Error("Not implemented")
  }

  async updateCells(
    eventId: string,
    versionId: string,
    request: BffUpdateCellsRequest,
  ): Promise<BffUpdateCellsResponse> {
    await this.delay(300)
    // Stub - will be implemented in Phase 2
    throw new Error("Not implemented")
  }

  async getCompare(request: BffBudgetCompareRequest): Promise<BffBudgetCompareResponse> {
    await this.delay(300)
    // Stub - will be implemented in Phase 2
    throw new Error("Not implemented")
  }

  // ============================================
  // Allocation operations
  // ============================================

  async listAllocationEvents(planEventId: string): Promise<BffListBudgetAllocationEventsResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === planEventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    // Return allocation events based on scenario type
    let events: BffBudgetAllocationEvent[] = []
    if (event.scenarioType === "BUDGET") {
      events = [...mockBudgetAllocationEvents]
    } else if (event.scenarioType === "FORECAST") {
      events = [...mockForecastAllocationEvents]
    }

    return { events }
  }

  async executeAllocation(request: BffExecuteBudgetAllocationRequest): Promise<BffExecuteBudgetAllocationResponse> {
    await this.delay(1500) // Simulate processing time

    const event = this.events.find((e) => e.id === request.planEventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    // Get allocation events
    let allocationEvents: BffBudgetAllocationEvent[] = []
    if (event.scenarioType === "BUDGET") {
      allocationEvents = mockBudgetAllocationEvents
    } else if (event.scenarioType === "FORECAST") {
      allocationEvents = mockForecastAllocationEvents
    }

    // Filter selected events
    const selectedEvents = allocationEvents.filter((e) => request.allocationEventIds.includes(e.id))

    // Generate mock results
    const results = selectedEvents.map((e) => ({
      eventId: e.id,
      eventName: e.eventName,
      status: "SUCCESS" as const,
      stepCount: e.stepCount,
      detailCount: Math.floor(Math.random() * 50) + 10,
      totalAllocatedAmount: Math.floor(Math.random() * 10000000) + 1000000,
    }))

    return {
      success: true,
      executionIds: results.map((r) => `exec-${r.eventId}-${Date.now()}`),
      results,
    }
  }

  async getAllocationStatus(planEventId: string): Promise<BffBudgetAllocationStatus> {
    await this.delay(200)

    const event = this.events.find((e) => e.id === planEventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    return {
      hasAllocationResult: event.allocationStatus === "EXECUTED",
      lastExecutedAt: event.allocationExecutedAt,
      lastExecutedBy: event.allocationExecutedBy,
    }
  }

  async getAllocationResult(planEventId: string, planVersionId?: string): Promise<BffBudgetAllocationResultResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === planEventId)
    if (!event) {
      throw new Error("BUDGET_EVENT_NOT_FOUND")
    }

    if (event.allocationStatus !== "EXECUTED") {
      return {
        planEventId: event.id,
        planEventName: event.eventName,
        planVersionId: planVersionId || "pv-001",
        planVersionName: event.latestVersionName,
        executions: [],
      }
    }

    // Get allocation events
    let allocationEvents: BffBudgetAllocationEvent[] = []
    if (event.scenarioType === "BUDGET") {
      allocationEvents = mockBudgetAllocationEvents.filter((e) => e.isActive)
    } else if (event.scenarioType === "FORECAST") {
      allocationEvents = mockForecastAllocationEvents.filter((e) => e.isActive)
    }

    // Generate mock result data
    const executions = allocationEvents.map((allocEvent, index) => ({
      executionId: `exec-${allocEvent.id}-${Date.now()}`,
      eventId: allocEvent.id,
      eventName: allocEvent.eventName,
      executedAt: event.allocationExecutedAt || new Date().toISOString(),
      executedBy: event.allocationExecutedBy || "システム",
      status: "SUCCESS" as const,
      steps: Array.from({ length: allocEvent.stepCount }, (_, stepIdx) => ({
        stepId: `step-${allocEvent.id}-${stepIdx + 1}`,
        stepNo: stepIdx + 1,
        stepName: `配賦ステップ${stepIdx + 1}`,
        fromSubjectCode: `${6000 + stepIdx}`,
        fromSubjectName: `間接費${stepIdx + 1}`,
        fromDepartmentCode: "COMMON",
        fromDepartmentName: "共通部門",
        sourceAmount: Math.floor(Math.random() * 5000000) + 1000000,
        details: mockDepartments.slice(0, 3).map((dept, detailIdx) => ({
          detailId: `detail-${allocEvent.id}-${stepIdx + 1}-${detailIdx + 1}`,
          targetType: "DEPARTMENT" as const,
          targetCode: dept.departmentCode,
          targetName: dept.departmentName,
          toSubjectCode: `${4000 + stepIdx}`,
          toSubjectName: `製造原価${stepIdx + 1}`,
          driverType: "HEADCOUNT",
          driverValue: Math.floor(Math.random() * 50) + 10,
          ratio: Number((1 / 3).toFixed(4)),
          allocatedAmount: Math.floor(Math.random() * 1000000) + 100000,
        })),
      })),
    }))

    return {
      planEventId: event.id,
      planEventName: event.eventName,
      planVersionId: planVersionId || "pv-001",
      planVersionName: event.latestVersionName,
      executions,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
