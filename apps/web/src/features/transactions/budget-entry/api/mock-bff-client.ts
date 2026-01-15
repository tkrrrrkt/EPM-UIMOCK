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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
