import type { BffClient } from "./bff-client"
import type {
  BffListMtpEventsRequest,
  BffListMtpEventsResponse,
  BffMtpEventDetailResponse,
  BffCreateMtpEventRequest,
  BffUpdateMtpEventRequest,
  BffDuplicateMtpEventRequest,
  BffMtpEventResponse,
  BffGetMtpAmountsRequest,
  BffMtpAmountsResponse,
  BffSaveMtpAmountsRequest,
  BffSaveMtpAmountsResponse,
  BffMtpOverviewResponse,
  BffGetMtpTrendRequest,
  BffMtpTrendResponse,
  BffListStrategyThemesResponse,
  BffCreateStrategyThemeRequest,
  BffUpdateStrategyThemeRequest,
  BffStrategyThemeResponse,
  BffMtpEventSummary,
  BffDimensionValueSummary,
  BffSubjectRow,
  BffAmountColumn,
  BffMtpAmountCell,
  BffOverviewAmountCell,
  BffTrendDataPoint,
  BffStrategyThemeSummary,
} from "@epm/contracts/bff/mtp"

// Mock data
const mockEvents: BffMtpEventSummary[] = [
  {
    id: "mtp-001",
    eventCode: "MTP2026",
    eventName: "2026年中期経営計画",
    planYears: 3,
    startFiscalYear: 2026,
    endFiscalYear: 2028,
    status: "DRAFT",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "mtp-002",
    eventCode: "MTP2025",
    eventName: "2025年中期経営計画",
    planYears: 5,
    startFiscalYear: 2025,
    endFiscalYear: 2029,
    status: "CONFIRMED",
    updatedAt: "2025-04-01T10:30:00Z",
  },
  {
    id: "mtp-003",
    eventCode: "MTP2024",
    eventName: "2024年中期経営計画（改定）",
    planYears: 3,
    startFiscalYear: 2024,
    endFiscalYear: 2026,
    status: "CONFIRMED",
    updatedAt: "2024-03-15T14:00:00Z",
  },
]

const mockDimensionValues: BffDimensionValueSummary[] = [
  { id: "dv-all", valueCode: "ALL", valueName: "全社合計" },
  { id: "dv-001", valueCode: "DIV_A", valueName: "A事業部" },
  { id: "dv-002", valueCode: "DIV_B", valueName: "B事業部" },
  { id: "dv-003", valueCode: "DIV_C", valueName: "C事業部" },
]

// ツリー構造を持つ科目マスタ（レイアウトマスタに基づく階層表示）
const mockSubjects: BffSubjectRow[] = [
  // 売上高（親）
  { id: "subj-001", subjectCode: "1000", subjectName: "売上高", sortOrder: 1, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["売上高"] },
  { id: "subj-001-1", subjectCode: "1010", subjectName: "製品売上高", sortOrder: 2, isAggregate: false, parentRowId: "subj-001", indentLevel: 1, treePath: ["売上高", "製品売上高"] },
  { id: "subj-001-2", subjectCode: "1020", subjectName: "サービス売上高", sortOrder: 3, isAggregate: false, parentRowId: "subj-001", indentLevel: 1, treePath: ["売上高", "サービス売上高"] },
  { id: "subj-001-3", subjectCode: "1030", subjectName: "その他売上高", sortOrder: 4, isAggregate: false, parentRowId: "subj-001", indentLevel: 1, treePath: ["売上高", "その他売上高"] },

  // 売上原価（親）
  { id: "subj-002", subjectCode: "2000", subjectName: "売上原価", sortOrder: 5, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["売上原価"] },
  { id: "subj-002-1", subjectCode: "2010", subjectName: "材料費", sortOrder: 6, isAggregate: false, parentRowId: "subj-002", indentLevel: 1, treePath: ["売上原価", "材料費"] },
  { id: "subj-002-2", subjectCode: "2020", subjectName: "労務費", sortOrder: 7, isAggregate: false, parentRowId: "subj-002", indentLevel: 1, treePath: ["売上原価", "労務費"] },
  { id: "subj-002-3", subjectCode: "2030", subjectName: "外注費", sortOrder: 8, isAggregate: false, parentRowId: "subj-002", indentLevel: 1, treePath: ["売上原価", "外注費"] },
  { id: "subj-002-4", subjectCode: "2040", subjectName: "製造経費", sortOrder: 9, isAggregate: false, parentRowId: "subj-002", indentLevel: 1, treePath: ["売上原価", "製造経費"] },

  // 売上総利益（集計行）
  { id: "subj-003", subjectCode: "3000", subjectName: "売上総利益", sortOrder: 10, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["売上総利益"] },

  // 販管費（親）
  { id: "subj-004", subjectCode: "4000", subjectName: "販管費", sortOrder: 11, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["販管費"] },
  { id: "subj-004-1", subjectCode: "4010", subjectName: "人件費", sortOrder: 12, isAggregate: false, parentRowId: "subj-004", indentLevel: 1, treePath: ["販管費", "人件費"] },
  { id: "subj-004-2", subjectCode: "4020", subjectName: "広告宣伝費", sortOrder: 13, isAggregate: false, parentRowId: "subj-004", indentLevel: 1, treePath: ["販管費", "広告宣伝費"] },
  { id: "subj-004-3", subjectCode: "4030", subjectName: "研究開発費", sortOrder: 14, isAggregate: false, parentRowId: "subj-004", indentLevel: 1, treePath: ["販管費", "研究開発費"] },
  { id: "subj-004-4", subjectCode: "4040", subjectName: "その他経費", sortOrder: 15, isAggregate: false, parentRowId: "subj-004", indentLevel: 1, treePath: ["販管費", "その他経費"] },

  // 営業利益（集計行）
  { id: "subj-005", subjectCode: "5000", subjectName: "営業利益", sortOrder: 16, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["営業利益"] },

  // 営業外収益（親）
  { id: "subj-006", subjectCode: "6000", subjectName: "営業外収益", sortOrder: 17, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["営業外収益"] },
  { id: "subj-006-1", subjectCode: "6010", subjectName: "受取利息", sortOrder: 18, isAggregate: false, parentRowId: "subj-006", indentLevel: 1, treePath: ["営業外収益", "受取利息"] },
  { id: "subj-006-2", subjectCode: "6020", subjectName: "受取配当金", sortOrder: 19, isAggregate: false, parentRowId: "subj-006", indentLevel: 1, treePath: ["営業外収益", "受取配当金"] },

  // 営業外費用（親）
  { id: "subj-007", subjectCode: "7000", subjectName: "営業外費用", sortOrder: 20, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["営業外費用"] },
  { id: "subj-007-1", subjectCode: "7010", subjectName: "支払利息", sortOrder: 21, isAggregate: false, parentRowId: "subj-007", indentLevel: 1, treePath: ["営業外費用", "支払利息"] },

  // 経常利益（集計行）
  { id: "subj-008", subjectCode: "8000", subjectName: "経常利益", sortOrder: 22, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["経常利益"] },

  // 当期純利益（集計行）
  { id: "subj-009", subjectCode: "9000", subjectName: "当期純利益", sortOrder: 23, isAggregate: true, parentRowId: null, indentLevel: 0, treePath: ["当期純利益"] },
]

export class MockBffClient implements BffClient {
  private events = [...mockEvents]

  async listEvents(request: BffListMtpEventsRequest): Promise<BffListMtpEventsResponse> {
    await this.delay(300)

    let filtered = [...this.events]

    if (request.status) {
      filtered = filtered.filter((e) => e.status === request.status)
    }

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

  async getEventDetail(eventId: string): Promise<BffMtpEventDetailResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    return {
      ...event,
      dimensionId: "dim-001",
      layoutId: "layout-001",
      dimensionName: "事業部",
      layoutName: "標準PL",
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
      dimensionValues: mockDimensionValues,
    }
  }

  async createEvent(request: BffCreateMtpEventRequest): Promise<BffMtpEventResponse> {
    await this.delay(500)

    const newEvent: BffMtpEventResponse = {
      id: `mtp-${Date.now()}`,
      eventCode: request.eventCode,
      eventName: request.eventName,
      planYears: request.planYears,
      startFiscalYear: request.startFiscalYear,
      endFiscalYear: request.startFiscalYear + request.planYears - 1,
      dimensionId: request.dimensionId,
      layoutId: request.layoutId,
      status: "DRAFT",
      description: request.description ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.events.unshift(newEvent)
    return newEvent
  }

  async updateEvent(eventId: string, request: BffUpdateMtpEventRequest): Promise<BffMtpEventResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const updated = {
      ...event,
      eventName: request.eventName ?? event.eventName,
      status: request.status ?? event.status,
      updatedAt: new Date().toISOString(),
    }

    const index = this.events.findIndex((e) => e.id === eventId)
    this.events[index] = updated

    return {
      ...updated,
      dimensionId: "dim-001",
      layoutId: "layout-001",
      description: null,
      createdAt: "2026-01-01T00:00:00Z",
    }
  }

  async duplicateEvent(eventId: string, request: BffDuplicateMtpEventRequest): Promise<BffMtpEventResponse> {
    await this.delay(500)

    const original = this.events.find((e) => e.id === eventId)
    if (!original) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const newEvent: BffMtpEventResponse = {
      id: `mtp-${Date.now()}`,
      eventCode: request.newEventCode,
      eventName: request.newEventName,
      planYears: original.planYears,
      startFiscalYear: original.startFiscalYear,
      endFiscalYear: original.endFiscalYear,
      dimensionId: "dim-001",
      layoutId: "layout-001",
      status: "DRAFT",
      description: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.events.unshift(newEvent)
    return newEvent
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    if (event.status === "CONFIRMED") {
      throw new Error("MTP_EVENT_CONFIRMED_DELETE_DENIED")
    }

    this.events = this.events.filter((e) => e.id !== eventId)
  }

  async getAmounts(eventId: string, request: BffGetMtpAmountsRequest): Promise<BffMtpAmountsResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const columns: BffAmountColumn[] = []
    const startYear = event.startFiscalYear
    const planYears = event.planYears

    // 実績列
    for (let i = 0; i < planYears; i++) {
      columns.push({ fiscalYear: startYear - planYears + i, isActual: true })
    }

    // 計画列
    for (let i = 0; i < planYears; i++) {
      columns.push({ fiscalYear: startYear + i, isActual: false })
    }

    const amounts: BffMtpAmountCell[] = [
      // 実績データ（売上高）
      { subjectId: "subj-001", fiscalYear: 2023, amount: "9000000000", isActual: true },
      { subjectId: "subj-001", fiscalYear: 2024, amount: "9500000000", isActual: true },
      { subjectId: "subj-001", fiscalYear: 2025, amount: "10000000000", isActual: true },
      // 計画データ（売上高）
      { subjectId: "subj-001", fiscalYear: 2026, amount: "10000000000", isActual: false },
      { subjectId: "subj-001", fiscalYear: 2027, amount: "11000000000", isActual: false },
      { subjectId: "subj-001", fiscalYear: 2028, amount: "12000000000", isActual: false },
      // 売上原価
      { subjectId: "subj-002", fiscalYear: 2023, amount: "5500000000", isActual: true },
      { subjectId: "subj-002", fiscalYear: 2024, amount: "5800000000", isActual: true },
      { subjectId: "subj-002", fiscalYear: 2025, amount: "6000000000", isActual: true },
      { subjectId: "subj-002", fiscalYear: 2026, amount: "6000000000", isActual: false },
      { subjectId: "subj-002", fiscalYear: 2027, amount: "6500000000", isActual: false },
      { subjectId: "subj-002", fiscalYear: 2028, amount: "7000000000", isActual: false },
      // 販管費
      { subjectId: "subj-004", fiscalYear: 2023, amount: "2200000000", isActual: true },
      { subjectId: "subj-004", fiscalYear: 2024, amount: "2350000000", isActual: true },
      { subjectId: "subj-004", fiscalYear: 2025, amount: "2500000000", isActual: true },
      { subjectId: "subj-004", fiscalYear: 2026, amount: "2500000000", isActual: false },
      { subjectId: "subj-004", fiscalYear: 2027, amount: "2700000000", isActual: false },
      { subjectId: "subj-004", fiscalYear: 2028, amount: "2900000000", isActual: false },
    ]

    const isReadOnly = !request.dimensionValueId || event.status === "CONFIRMED"

    return {
      subjects: mockSubjects,
      columns,
      amounts,
      isReadOnly,
    }
  }

  async saveAmounts(eventId: string, request: BffSaveMtpAmountsRequest): Promise<BffSaveMtpAmountsResponse> {
    await this.delay(500)

    return {
      savedCount: request.amounts.length,
      updatedAt: new Date().toISOString(),
    }
  }

  async getOverview(eventId: string): Promise<BffMtpOverviewResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const fiscalYears: number[] = []
    for (let i = 0; i < event.planYears; i++) {
      fiscalYears.push(event.startFiscalYear + i)
    }

    const amounts: BffOverviewAmountCell[] = [
      // FY2026
      { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: null, amount: "30000000000" },
      { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: "dv-001", amount: "12000000000" },
      { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: "dv-002", amount: "10000000000" },
      { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: "dv-003", amount: "8000000000" },
      { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: null, amount: "4500000000" },
      { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: "dv-001", amount: "2000000000" },
      { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: "dv-002", amount: "1500000000" },
      { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: "dv-003", amount: "1000000000" },
      // FY2027
      { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: null, amount: "33000000000" },
      { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: "dv-001", amount: "13000000000" },
      { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: "dv-002", amount: "11000000000" },
      { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: "dv-003", amount: "9000000000" },
      { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: null, amount: "5000000000" },
      { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: "dv-001", amount: "2200000000" },
      { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: "dv-002", amount: "1700000000" },
      { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: "dv-003", amount: "1100000000" },
      // FY2028
      { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: null, amount: "36000000000" },
      { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: "dv-001", amount: "14000000000" },
      { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: "dv-002", amount: "12000000000" },
      { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: "dv-003", amount: "10000000000" },
      { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: null, amount: "5500000000" },
      { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: "dv-001", amount: "2400000000" },
      { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: "dv-002", amount: "1900000000" },
      { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: "dv-003", amount: "1200000000" },
    ]

    return {
      subjects: mockSubjects,
      fiscalYears,
      dimensionValues: mockDimensionValues,
      amounts,
    }
  }

  async getTrend(eventId: string, request: BffGetMtpTrendRequest): Promise<BffMtpTrendResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const dataPoints: BffTrendDataPoint[] = [
      { fiscalYear: 2023, amount: 9000000000, isActual: true },
      { fiscalYear: 2024, amount: 9500000000, isActual: true },
      { fiscalYear: 2025, amount: 10000000000, isActual: true },
      { fiscalYear: 2026, amount: 10000000000, isActual: false },
      { fiscalYear: 2027, amount: 11000000000, isActual: false },
      { fiscalYear: 2028, amount: 12000000000, isActual: false },
    ]

    return {
      subject: mockSubjects[0],
      dimensionValue: null,
      dataPoints,
      tableData: [
        {
          subjectId: "subj-001",
          subjectName: "売上高",
          amounts: [
            { fiscalYear: 2023, amount: "9000000000", isActual: true },
            { fiscalYear: 2024, amount: "9500000000", isActual: true },
            { fiscalYear: 2025, amount: "10000000000", isActual: true },
            { fiscalYear: 2026, amount: "10000000000", isActual: false },
            { fiscalYear: 2027, amount: "11000000000", isActual: false },
            { fiscalYear: 2028, amount: "12000000000", isActual: false },
          ],
        },
      ],
    }
  }

  async listThemes(eventId: string): Promise<BffListStrategyThemesResponse> {
    await this.delay(300)

    const mockThemes: BffStrategyThemeSummary[] = [
      {
        id: "theme-001",
        themeCode: "STR001",
        themeName: "デジタル変革推進",
        parentThemeId: null,
        dimensionValueId: null,
        dimensionValueName: null,
        strategyCategory: "成長戦略",
        ownerName: "山田太郎",
        targetDate: "2028-03-31",
        kpis: [{ subjectId: "subj-001", subjectCode: "1000", subjectName: "売上高" }],
        children: [
          {
            id: "theme-002",
            themeCode: "STR002",
            themeName: "AI活用促進",
            parentThemeId: "theme-001",
            dimensionValueId: "dv-001",
            dimensionValueName: "A事業部",
            strategyCategory: "デジタル",
            ownerName: "佐藤花子",
            targetDate: "2027-12-31",
            kpis: [],
            children: [],
          },
        ],
      },
    ]

    return { themes: mockThemes }
  }

  async createTheme(eventId: string, request: BffCreateStrategyThemeRequest): Promise<BffStrategyThemeResponse> {
    await this.delay(500)

    return {
      id: `theme-${Date.now()}`,
      themeCode: request.themeCode,
      themeName: request.themeName,
      parentThemeId: request.parentThemeId ?? null,
      dimensionValueId: request.dimensionValueId ?? null,
      strategyCategory: request.strategyCategory ?? null,
      description: request.description ?? null,
      ownerEmployeeId: request.ownerEmployeeId ?? null,
      ownerName: null,
      targetDate: request.targetDate ?? null,
      kpis: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateTheme(
    eventId: string,
    themeId: string,
    request: BffUpdateStrategyThemeRequest,
  ): Promise<BffStrategyThemeResponse> {
    await this.delay(300)

    return {
      id: themeId,
      themeCode: "STR001",
      themeName: request.themeName ?? "Updated Theme",
      parentThemeId: null,
      dimensionValueId: null,
      strategyCategory: request.strategyCategory ?? null,
      description: request.description ?? null,
      ownerEmployeeId: request.ownerEmployeeId ?? null,
      ownerName: null,
      targetDate: request.targetDate ?? null,
      kpis: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteTheme(eventId: string, themeId: string): Promise<void> {
    await this.delay(300)
  }

  // 一括入力用: 全ディメンション値のデータを取得
  async getBulkAmounts(
    eventId: string,
  ): Promise<
    Array<{
      dimensionValueId: string
      subjects: BffSubjectRow[]
      columns: BffAmountColumn[]
      amounts: BffMtpAmountCell[]
      isReadOnly: boolean
    }>
  > {
    await this.delay(500)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("MTP_EVENT_NOT_FOUND")
    }

    const columns: BffAmountColumn[] = []
    const startYear = event.startFiscalYear
    const planYears = event.planYears

    // 実績列
    for (let i = 0; i < planYears; i++) {
      columns.push({ fiscalYear: startYear - planYears + i, isActual: true })
    }

    // 計画列
    for (let i = 0; i < planYears; i++) {
      columns.push({ fiscalYear: startYear + i, isActual: false })
    }

    return mockDimensionValues.map((dv) => {
      const isTotal = dv.valueCode === "ALL"
      const isReadOnly = event.status === "CONFIRMED" || isTotal

      // 各事業部ごとに異なる金額を生成
      const dvMultiplier = isTotal ? 1 : { "dv-001": 0.4, "dv-002": 0.35, "dv-003": 0.25 }[dv.id] || 0.33

      const amounts: BffMtpAmountCell[] = []

      // 実績データ
      for (let i = 0; i < planYears; i++) {
        const year = startYear - planYears + i
        mockSubjects
          .filter((s) => !s.isAggregate)
          .forEach((subject) => {
            amounts.push({
              subjectId: subject.id,
              fiscalYear: year,
              amount: String(Math.round(this.getBaseActualAmount(subject.id, year) * dvMultiplier)),
              isActual: true,
            })
          })
      }

      // 計画データ
      for (let i = 0; i < planYears; i++) {
        const year = startYear + i
        mockSubjects
          .filter((s) => !s.isAggregate)
          .forEach((subject) => {
            amounts.push({
              subjectId: subject.id,
              fiscalYear: year,
              amount: String(Math.round(this.getBasePlanAmount(subject.id, year, startYear) * dvMultiplier)),
              isActual: false,
            })
          })
      }

      return {
        dimensionValueId: dv.id,
        subjects: mockSubjects,
        columns,
        amounts,
        isReadOnly,
      }
    })
  }

  private getBaseActualAmount(subjectId: string, year: number): number {
    const baseAmounts: Record<string, number> = {
      "subj-001": 9000000000, // 売上高
      "subj-002": 5500000000, // 売上原価
      "subj-004": 2200000000, // 販管費
    }
    const base = baseAmounts[subjectId] || 1000000000
    const growth = (year - 2023) * 500000000
    return base + growth
  }

  private getBasePlanAmount(subjectId: string, year: number, startYear: number): number {
    const baseAmounts: Record<string, number> = {
      "subj-001": 10000000000, // 売上高
      "subj-002": 6000000000, // 売上原価
      "subj-004": 2500000000, // 販管費
    }
    const base = baseAmounts[subjectId] || 1000000000
    const growth = (year - startYear) * 1000000000
    return base + growth
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
