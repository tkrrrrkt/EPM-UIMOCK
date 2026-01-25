import type {
  BffListGuidelineEventsRequest,
  BffListGuidelineEventsResponse,
  BffGuidelineEventSummary,
  BffGuidelineEventDetailResponse,
  BffCreateGuidelineEventRequest,
  BffUpdateGuidelineEventRequest,
  BffDuplicateGuidelineEventRequest,
  BffGuidelineEventResponse,
  BffGetGuidelineAmountsRequest,
  BffGuidelineAmountsResponse,
  BffSaveGuidelineAmountsRequest,
  BffSaveGuidelineAmountsResponse,
  BffGetActualsRequest,
  BffActualsResponse,
  BffOverviewResponse,
  BffGetTrendRequest,
  BffTrendResponse,
  BffSubjectRow,
  BffDimensionValueSummary,
  BffDimensionSummary,
  BffLayoutSummary,
} from "@epm/contracts/bff/budget-guideline"

// ============================================
// Mock Data
// ============================================
const mockSubjects: BffSubjectRow[] = [
  { id: "subj-001", subjectCode: "SALES", subjectName: "売上高", sortOrder: 1, isAggregate: false },
  { id: "subj-002", subjectCode: "COGS", subjectName: "売上原価", sortOrder: 2, isAggregate: false },
  { id: "subj-003", subjectCode: "GROSS", subjectName: "売上総利益", sortOrder: 3, isAggregate: true },
  { id: "subj-004", subjectCode: "SGA", subjectName: "販管費", sortOrder: 4, isAggregate: false },
  { id: "subj-005", subjectCode: "OP", subjectName: "営業利益", sortOrder: 5, isAggregate: true },
]

const mockDimensionValues: BffDimensionValueSummary[] = [
  { id: "dv-total", valueCode: "TOTAL", valueName: "全社", isTotal: true },
  { id: "dv-001", valueCode: "BU-A", valueName: "A事業部", isTotal: false },
  { id: "dv-002", valueCode: "BU-B", valueName: "B事業部", isTotal: false },
  { id: "dv-003", valueCode: "BU-C", valueName: "C事業部", isTotal: false },
]

const mockDimensions: BffDimensionSummary[] = [
  { id: "dim-001", dimensionCode: "BU", dimensionName: "事業部セグメント" },
  { id: "dim-002", dimensionCode: "REGION", dimensionName: "地域セグメント" },
]

const mockLayouts: BffLayoutSummary[] = [
  { id: "layout-001", layoutCode: "PL_STD", layoutName: "標準PL科目", layoutType: "GUIDELINE" },
  { id: "layout-002", layoutCode: "PL_FULL", layoutName: "詳細PL科目", layoutType: "GUIDELINE" },
]

const mockEvents: BffGuidelineEventSummary[] = [
  {
    id: "gl-001",
    eventCode: "FY2026_GL_ANNUAL",
    eventName: "FY2026 年度ガイドライン",
    fiscalYear: 2026,
    periodType: "ANNUAL",
    periodNo: 1,
    status: "DRAFT",
    updatedAt: "2026-01-10T10:30:00Z",
  },
  {
    id: "gl-002",
    eventCode: "FY2026_GL_H1",
    eventName: "FY2026 上期ガイドライン",
    fiscalYear: 2026,
    periodType: "HALF",
    periodNo: 1,
    status: "CONFIRMED",
    updatedAt: "2026-01-05T15:00:00Z",
  },
  {
    id: "gl-003",
    eventCode: "FY2026_GL_Q1",
    eventName: "FY2026 Q1ガイドライン",
    fiscalYear: 2026,
    periodType: "QUARTER",
    periodNo: 1,
    status: "DRAFT",
    updatedAt: "2026-01-08T09:00:00Z",
  },
]

const mockAmountData: Record<string, Record<string, string>> = {
  "subj-001": { "GL-2026": "11000", "GL-2026-H1": "5000", "GL-2026-H2": "6000" },
  "subj-002": { "GL-2026": "6200", "GL-2026-H1": "2800", "GL-2026-H2": "3400" },
  "subj-004": { "GL-2026": "2800", "GL-2026-H1": "1300", "GL-2026-H2": "1500" },
}

// ============================================
// Mock BFF Client
// ============================================
export class MockBffClient {
  async listEvents(request: BffListGuidelineEventsRequest = {}): Promise<BffListGuidelineEventsResponse> {
    await this.delay(300)

    let filtered = [...mockEvents]

    if (request.status) {
      filtered = filtered.filter((e) => e.status === request.status)
    }
    if (request.fiscalYear) {
      filtered = filtered.filter((e) => e.fiscalYear === request.fiscalYear)
    }
    if (request.periodType) {
      filtered = filtered.filter((e) => e.periodType === request.periodType)
    }

    const page = request.page || 1
    const pageSize = request.pageSize || 20
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items,
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getEventDetail(eventId: string): Promise<BffGuidelineEventDetailResponse> {
    await this.delay(200)

    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    return {
      ...event,
      dimensionId: "dim-001",
      layoutId: "layout-001",
      description: `${event.eventName}の詳細`,
      dimensionName: "事業部セグメント",
      layoutName: "標準PL科目",
      dimensionValues: mockDimensionValues,
      createdAt: "2026-01-01T00:00:00Z",
    }
  }

  async createEvent(request: BffCreateGuidelineEventRequest): Promise<BffGuidelineEventResponse> {
    await this.delay(400)

    const newEvent: BffGuidelineEventResponse = {
      id: `gl-${Date.now()}`,
      eventCode: request.eventCode,
      eventName: request.eventName,
      fiscalYear: request.fiscalYear,
      periodType: request.periodType,
      periodNo: request.periodNo,
      dimensionId: request.dimensionId,
      layoutId: request.layoutId,
      description: request.description ?? null,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockEvents.push({
      id: newEvent.id,
      eventCode: newEvent.eventCode,
      eventName: newEvent.eventName,
      fiscalYear: newEvent.fiscalYear,
      periodType: newEvent.periodType,
      periodNo: newEvent.periodNo,
      status: newEvent.status,
      updatedAt: newEvent.updatedAt,
    })

    return newEvent
  }

  async updateEvent(eventId: string, request: BffUpdateGuidelineEventRequest): Promise<BffGuidelineEventResponse> {
    await this.delay(300)

    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    if (request.eventName) event.eventName = request.eventName
    if (request.status) event.status = request.status
    event.updatedAt = new Date().toISOString()

    return this.getEventDetail(eventId)
  }

  async duplicateEvent(
    eventId: string,
    request: BffDuplicateGuidelineEventRequest,
  ): Promise<BffGuidelineEventResponse> {
    await this.delay(400)

    const sourceEvent = await this.getEventDetail(eventId)

    return this.createEvent({
      eventCode: request.newEventCode,
      eventName: request.newEventName,
      fiscalYear: sourceEvent.fiscalYear,
      periodType: sourceEvent.periodType,
      periodNo: sourceEvent.periodNo,
      dimensionId: sourceEvent.dimensionId,
      layoutId: sourceEvent.layoutId,
      description: sourceEvent.description ?? undefined,
    })
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delay(300)

    const index = mockEvents.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error("Event not found")
    }

    const event = mockEvents[index]
    if (event.status === "CONFIRMED") {
      throw new Error("Cannot delete confirmed event")
    }

    mockEvents.splice(index, 1)
  }

  async getGuidelineAmounts(
    eventId: string,
    request: BffGetGuidelineAmountsRequest = {},
  ): Promise<BffGuidelineAmountsResponse> {
    await this.delay(300)

    const event = await this.getEventDetail(eventId)
    const isReadOnly = event.status === "CONFIRMED" || request.dimensionValueId === "dv-total"

    const guidelinePeriods = this.getGuidelinePeriods(event.periodType, event.fiscalYear)
    const amounts = this.buildAmountCells(guidelinePeriods)

    return {
      subjects: mockSubjects,
      guidelinePeriods,
      amounts,
      isReadOnly,
    }
  }

  async saveGuidelineAmounts(
    eventId: string,
    request: BffSaveGuidelineAmountsRequest,
  ): Promise<BffSaveGuidelineAmountsResponse> {
    await this.delay(400)

    return {
      savedCount: request.amounts.length,
      updatedAt: new Date().toISOString(),
    }
  }

  async getActuals(eventId: string, request: BffGetActualsRequest = {}): Promise<BffActualsResponse> {
    await this.delay(300)

    const yearsBack = request.yearsBack || 5
    const currentYear = 2025
    const fiscalYears = Array.from({ length: yearsBack }, (_, i) => currentYear - yearsBack + 1 + i)

    const amounts = fiscalYears.flatMap((year) =>
      mockSubjects
        .filter((s) => !s.isAggregate)
        .map((subject) => ({
          subjectId: subject.id,
          fiscalYear: year,
          amount: this.generateActualAmount(subject.id, year),
        })),
    )

    return {
      subjects: mockSubjects,
      fiscalYears,
      amounts,
    }
  }

  async getOverview(eventId: string): Promise<BffOverviewResponse> {
    await this.delay(400)

    const event = await this.getEventDetail(eventId)
    const guidelineYear = event.fiscalYear
    const actualYears = [guidelineYear - 5, guidelineYear - 4, guidelineYear - 3, guidelineYear - 2, guidelineYear - 1]

    const dimensionValueIds: (string | null)[] = [
      null,
      ...mockDimensionValues.filter((dv) => !dv.isTotal).map((dv) => dv.id),
    ]

    const amounts = mockSubjects.flatMap((subject) => {
      const cells: Array<{
        subjectId: string
        fiscalYear: number
        dimensionValueId: string | null
        amount: string
        isActual: boolean
      }> = []

      actualYears.forEach((year) => {
        dimensionValueIds.forEach((dvId) => {
          cells.push({
            subjectId: subject.id,
            fiscalYear: year,
            dimensionValueId: dvId,
            amount: this.generateOverviewAmount(subject.id, year, dvId),
            isActual: true,
          })
        })
      })

      dimensionValueIds.forEach((dvId) => {
        cells.push({
          subjectId: subject.id,
          fiscalYear: guidelineYear,
          dimensionValueId: dvId,
          amount: this.generateOverviewAmount(subject.id, guidelineYear, dvId),
          isActual: false,
        })
      })

      return cells
    })

    return {
      subjects: mockSubjects,
      actualYears,
      guidelineYear,
      dimensionValues: mockDimensionValues,
      amounts,
    }
  }

  private generateOverviewAmount(subjectId: string, year: number, dimensionValueId: string | null): string {
    const baseAmounts: Record<string, number> = {
      "subj-001": 10000,
      "subj-002": 6000,
      "subj-003": 4000,
      "subj-004": 2500,
      "subj-005": 1500,
    }
    const base = baseAmounts[subjectId] || 1000
    const yearFactor = 1 + (year - 2021) * 0.05
    const orgFactor = dimensionValueId === null ? 1 : 0.33

    return String(Math.round(base * yearFactor * orgFactor))
  }

  async getTrend(eventId: string, request: BffGetTrendRequest = {}): Promise<BffTrendResponse> {
    await this.delay(400)

    const selectedSubjectId = request.subjectId || "subj-001"
    const selectedDimensionValueId = request.dimensionValueId || null

    const dataPoints = [
      { fiscalYear: 2021, isActual: true, amount: "8000" },
      { fiscalYear: 2022, isActual: true, amount: "8500" },
      { fiscalYear: 2023, isActual: true, amount: "9000" },
      { fiscalYear: 2024, isActual: true, amount: "9500" },
      { fiscalYear: 2025, isActual: true, amount: "10000" },
      { fiscalYear: 2026, isActual: false, amount: "11000" },
    ]

    return {
      subjects: mockSubjects,
      dimensionValues: mockDimensionValues,
      selectedSubjectId,
      selectedDimensionValueId,
      dataPoints,
    }
  }

  async getBulkGuidelineAmounts(
    eventId: string,
  ): Promise<
    Array<{
      dimensionValueId: string
      subjects: BffSubjectRow[]
      guidelinePeriods: Array<{
        key: string
        label: string
        fiscalYear: number
        periodType: "ANNUAL" | "HALF" | "QUARTER"
        periodNo: number
      }>
      guidelineAmounts: Array<{ subjectId: string; periodKey: string; amount: string }>
      actualsYears: number[]
      actualsAmounts: Array<{ subjectId: string; fiscalYear: number; amount: string }>
      isReadOnly: boolean
    }>
  > {
    await this.delay(500)

    const event = await this.getEventDetail(eventId)
    const guidelinePeriods = this.getGuidelinePeriods(event.periodType, event.fiscalYear)
    const yearsBack = 5
    const currentYear = 2025
    const fiscalYears = Array.from({ length: yearsBack }, (_, i) => currentYear - yearsBack + 1 + i)

    return mockDimensionValues.map((dv) => {
      const isTotal = dv.isTotal
      const isReadOnly = event.status === "CONFIRMED" || isTotal

      const dvMultiplier = isTotal ? 1 : { "dv-001": 0.4, "dv-002": 0.35, "dv-003": 0.25 }[dv.id] || 0.33

      const guidelineAmounts = guidelinePeriods.flatMap((period) =>
        mockSubjects
          .filter((s) => !s.isAggregate)
          .map((subject) => ({
            subjectId: subject.id,
            periodKey: period.key,
            amount: String(Math.round(this.getBaseAmount(subject.id) * dvMultiplier)),
          })),
      )

      const actualsAmounts = fiscalYears.flatMap((year) =>
        mockSubjects
          .filter((s) => !s.isAggregate)
          .map((subject) => ({
            subjectId: subject.id,
            fiscalYear: year,
            amount: String(Math.round(Number(this.generateActualAmount(subject.id, year)) * dvMultiplier)),
          })),
      )

      return {
        dimensionValueId: dv.id,
        subjects: mockSubjects,
        guidelinePeriods,
        guidelineAmounts,
        actualsYears: fiscalYears,
        actualsAmounts,
        isReadOnly,
      }
    })
  }

  private getBaseAmount(subjectId: string): number {
    return { "subj-001": 11000, "subj-002": 6200, "subj-004": 2800 }[subjectId] || 1000
  }

  async getDimensions(): Promise<BffDimensionSummary[]> {
    await this.delay(200)
    return mockDimensions
  }

  async getLayouts(layoutType?: string): Promise<BffLayoutSummary[]> {
    await this.delay(200)
    if (layoutType) {
      return mockLayouts.filter((l) => l.layoutType === layoutType)
    }
    return mockLayouts
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private getGuidelinePeriods(periodType: string, fiscalYear: number) {
    switch (periodType) {
      case "ANNUAL":
        return [
          { key: `GL-${fiscalYear}`, label: `FY${fiscalYear}`, fiscalYear, periodType: "ANNUAL" as const, periodNo: 1 },
        ]
      case "HALF":
        return [
          { key: `GL-${fiscalYear}-H1`, label: "上期", fiscalYear, periodType: "HALF" as const, periodNo: 1 },
          { key: `GL-${fiscalYear}-H2`, label: "下期", fiscalYear, periodType: "HALF" as const, periodNo: 2 },
        ]
      case "QUARTER":
        return [
          { key: `GL-${fiscalYear}-Q1`, label: "Q1", fiscalYear, periodType: "QUARTER" as const, periodNo: 1 },
          { key: `GL-${fiscalYear}-Q2`, label: "Q2", fiscalYear, periodType: "QUARTER" as const, periodNo: 2 },
          { key: `GL-${fiscalYear}-Q3`, label: "Q3", fiscalYear, periodType: "QUARTER" as const, periodNo: 3 },
          { key: `GL-${fiscalYear}-Q4`, label: "Q4", fiscalYear, periodType: "QUARTER" as const, periodNo: 4 },
        ]
      default:
        return []
    }
  }

  private buildAmountCells(periods: Array<{ key: string }>) {
    return periods.flatMap((period) =>
      Object.entries(mockAmountData).map(([subjectId, amounts]) => ({
        subjectId,
        periodKey: period.key,
        amount: amounts[period.key] || "0",
      })),
    )
  }

  private generateActualAmount(subjectId: string, year: number): string {
    const base = { "subj-001": 8000, "subj-002": 4800, "subj-004": 2100 }[subjectId] || 1000
    const growth = (year - 2021) * 500
    return String(base + growth)
  }
}
