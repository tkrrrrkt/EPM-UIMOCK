import type { ForecastBffClient } from "./BffClient"
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
  BffForecastRow,
  BffForecastPeriodColumn,
  BffForecastCell,
  BffForecastSummary,
  MonthStatus,
  BffForecastEventSummary,
} from "@epm/contracts/bff/forecast-entry"

// 拡張期間列定義: 4月,5月,6月,1Q,7月,8月,9月,2Q,上期,10月,11月,12月,3Q,1月,2月,3月,4Q,下期,通期
const EXTENDED_PERIODS: Array<{
  id: string
  no: number
  label: string
  type: "MONTH" | "QUARTER" | "HALF" | "ANNUAL"
  isAggregate: boolean
  monthIndex?: number // 月次の場合のインデックス (0-11)
}> = [
  { id: "m4", no: 1, label: "4月", type: "MONTH", isAggregate: false, monthIndex: 0 },
  { id: "m5", no: 2, label: "5月", type: "MONTH", isAggregate: false, monthIndex: 1 },
  { id: "m6", no: 3, label: "6月", type: "MONTH", isAggregate: false, monthIndex: 2 },
  { id: "q1", no: 4, label: "1Q", type: "QUARTER", isAggregate: true },
  { id: "m7", no: 5, label: "7月", type: "MONTH", isAggregate: false, monthIndex: 3 },
  { id: "m8", no: 6, label: "8月", type: "MONTH", isAggregate: false, monthIndex: 4 },
  { id: "m9", no: 7, label: "9月", type: "MONTH", isAggregate: false, monthIndex: 5 },
  { id: "q2", no: 8, label: "2Q", type: "QUARTER", isAggregate: true },
  { id: "h1", no: 9, label: "上期", type: "HALF", isAggregate: true },
  { id: "m10", no: 10, label: "10月", type: "MONTH", isAggregate: false, monthIndex: 6 },
  { id: "m11", no: 11, label: "11月", type: "MONTH", isAggregate: false, monthIndex: 7 },
  { id: "m12", no: 12, label: "12月", type: "MONTH", isAggregate: false, monthIndex: 8 },
  { id: "q3", no: 13, label: "3Q", type: "QUARTER", isAggregate: true },
  { id: "m1", no: 14, label: "1月", type: "MONTH", isAggregate: false, monthIndex: 9 },
  { id: "m2", no: 15, label: "2月", type: "MONTH", isAggregate: false, monthIndex: 10 },
  { id: "m3", no: 16, label: "3月", type: "MONTH", isAggregate: false, monthIndex: 11 },
  { id: "q4", no: 17, label: "4Q", type: "QUARTER", isAggregate: true },
  { id: "h2", no: 18, label: "下期", type: "HALF", isAggregate: true },
  { id: "fy", no: 19, label: "通期", type: "ANNUAL", isAggregate: true },
]

// 現在の月を取得（モック用：5月とする）
const CURRENT_MONTH = 5 // 5月

// 月の状態を決定（締め済み/締め処理中/見込）
function getMonthStatus(monthIndex: number): MonthStatus {
  // 4月=0, 5月=1, ... として、5月までは締め済み、6月は見込
  const closedMonths = CURRENT_MONTH - 4 // 4月始まりなので
  if (monthIndex < closedMonths) {
    return "ACTUAL" // 締め済み
  } else if (monthIndex === closedMonths) {
    return "CLOSING" // 仮締め中（当月）
  }
  return "FORECAST" // 見込
}

function createForecastPeriods(): BffForecastPeriodColumn[] {
  return EXTENDED_PERIODS.map((p) => {
    let monthStatus: MonthStatus = "FORECAST"
    let isEditable = !p.isAggregate

    if (p.monthIndex !== undefined) {
      monthStatus = getMonthStatus(p.monthIndex)
      // 締め済み月は編集不可
      if (monthStatus === "ACTUAL") {
        isEditable = false
      }
    }

    return {
      periodId: p.id,
      periodNo: p.no,
      periodLabel: p.label,
      periodType: p.type,
      monthStatus,
      isOpen: true,
      isEditable,
      isAggregate: p.isAggregate,
    }
  })
}

// 月次値から拡張セル（月+Q+上下期+通期）を生成（見込用）
function createForecastExtendedCells(
  monthlyValues: (number | null)[],
  actualValues?: (number | null)[]
): BffForecastCell[] {
  const q1 = (monthlyValues[0] ?? 0) + (monthlyValues[1] ?? 0) + (monthlyValues[2] ?? 0)
  const q2 = (monthlyValues[3] ?? 0) + (monthlyValues[4] ?? 0) + (monthlyValues[5] ?? 0)
  const h1 = q1 + q2
  const q3 = (monthlyValues[6] ?? 0) + (monthlyValues[7] ?? 0) + (monthlyValues[8] ?? 0)
  const q4 = (monthlyValues[9] ?? 0) + (monthlyValues[10] ?? 0) + (monthlyValues[11] ?? 0)
  const h2 = q3 + q4
  const fy = h1 + h2

  const extendedValues: { id: string; value: number | null; isEditable: boolean; monthIndex?: number }[] = [
    { id: "m4", value: monthlyValues[0], isEditable: true, monthIndex: 0 },
    { id: "m5", value: monthlyValues[1], isEditable: true, monthIndex: 1 },
    { id: "m6", value: monthlyValues[2], isEditable: true, monthIndex: 2 },
    { id: "q1", value: q1, isEditable: false },
    { id: "m7", value: monthlyValues[3], isEditable: true, monthIndex: 3 },
    { id: "m8", value: monthlyValues[4], isEditable: true, monthIndex: 4 },
    { id: "m9", value: monthlyValues[5], isEditable: true, monthIndex: 5 },
    { id: "q2", value: q2, isEditable: false },
    { id: "h1", value: h1, isEditable: false },
    { id: "m10", value: monthlyValues[6], isEditable: true, monthIndex: 6 },
    { id: "m11", value: monthlyValues[7], isEditable: true, monthIndex: 7 },
    { id: "m12", value: monthlyValues[8], isEditable: true, monthIndex: 8 },
    { id: "q3", value: q3, isEditable: false },
    { id: "m1", value: monthlyValues[9], isEditable: true, monthIndex: 9 },
    { id: "m2", value: monthlyValues[10], isEditable: true, monthIndex: 10 },
    { id: "m3", value: monthlyValues[11], isEditable: true, monthIndex: 11 },
    { id: "q4", value: q4, isEditable: false },
    { id: "h2", value: h2, isEditable: false },
    { id: "fy", value: fy, isEditable: false },
  ]

  return extendedValues.map((v) => {
    const monthStatus = v.monthIndex !== undefined ? getMonthStatus(v.monthIndex) : "FORECAST"
    const isEditable = v.isEditable && monthStatus !== "ACTUAL"

    return {
      periodId: v.id,
      value: v.value !== null ? String(v.value) : null,
      isEditable,
      isDirty: false,
      monthStatus,
      actualValue: actualValues && v.monthIndex !== undefined && monthStatus === "ACTUAL"
        ? String(actualValues[v.monthIndex] ?? 0)
        : undefined,
    }
  })
}

function calcAnnualTotal(monthlyValues: (number | null)[]): string {
  const sum = monthlyValues.reduce<number>((acc, v) => acc + (v ?? 0), 0)
  return String(sum)
}

// 確度展開データ付き行の型（UI用拡張）
export interface ForecastRowWithConfidence extends BffForecastRow {
  isConfidenceEnabled?: boolean
  isWnbEnabled?: boolean
  confidenceRows?: ConfidenceRowData[]
  summaryRow?: ConfidenceSummaryData
}

interface ConfidenceRowData {
  confidenceLevelId: string
  levelCode: string
  levelName: string
  probabilityRate: number
  colorCode: string
  cells: { periodId: string; value: string | null }[]
}

interface ConfidenceSummaryData {
  totalCells: { periodId: string; value: string }[]
  expectedCells: { periodId: string; value: string }[]
  budgetCells: { periodId: string; value: string }[]
}

// 確度マスタ（デフォルト）
const DEFAULT_CONFIDENCE_LEVELS = [
  { id: "conf-s", levelCode: "S", levelName: "受注", probabilityRate: 1.0, colorCode: "#22C55E" },
  { id: "conf-a", levelCode: "A", levelName: "80%受注", probabilityRate: 0.8, colorCode: "#84CC16" },
  { id: "conf-b", levelCode: "B", levelName: "50%受注", probabilityRate: 0.5, colorCode: "#EAB308" },
  { id: "conf-c", levelCode: "C", levelName: "20%受注", probabilityRate: 0.2, colorCode: "#F97316" },
  { id: "conf-d", levelCode: "D", levelName: "0%（案件化）", probabilityRate: 0.0, colorCode: "#EF4444" },
  { id: "conf-z", levelCode: "Z", levelName: "目安なし", probabilityRate: 0.0, colorCode: "#6B7280" },
]

// 確度別データを生成するヘルパー
function createConfidenceRows(monthlyTotals: (number | null)[]): {
  confidenceRows: ConfidenceRowData[]
  summaryRow: ConfidenceSummaryData
} {
  // 売上を確度別に分配（モック: S=40%, A=25%, B=15%, C=10%, D=5%, Z=5%）
  const distributions = [0.40, 0.25, 0.15, 0.10, 0.05, 0.05]

  const confidenceRows: ConfidenceRowData[] = DEFAULT_CONFIDENCE_LEVELS.map((level, idx) => {
    const cells = EXTENDED_PERIODS.map((period) => {
      if (period.monthIndex !== undefined) {
        const total = monthlyTotals[period.monthIndex]
        if (total !== null) {
          return {
            periodId: period.id,
            value: String(Math.round(total * distributions[idx])),
          }
        }
      }
      return { periodId: period.id, value: null }
    })

    return {
      confidenceLevelId: level.id,
      levelCode: level.levelCode,
      levelName: level.levelName,
      probabilityRate: level.probabilityRate,
      colorCode: level.colorCode,
      cells,
    }
  })

  // サマリー計算
  const totalCells = EXTENDED_PERIODS.map((period) => {
    if (period.monthIndex !== undefined) {
      const sum = confidenceRows.reduce((acc, row) => {
        const cell = row.cells.find((c) => c.periodId === period.id)
        return acc + (parseFloat(cell?.value ?? "0") || 0)
      }, 0)
      return { periodId: period.id, value: String(sum) }
    }
    return { periodId: period.id, value: "0" }
  })

  const expectedCells = EXTENDED_PERIODS.map((period) => {
    if (period.monthIndex !== undefined) {
      const sum = confidenceRows.reduce((acc, row) => {
        const cell = row.cells.find((c) => c.periodId === period.id)
        const value = parseFloat(cell?.value ?? "0") || 0
        return acc + value * row.probabilityRate
      }, 0)
      return { periodId: period.id, value: String(Math.round(sum)) }
    }
    return { periodId: period.id, value: "0" }
  })

  // 予算は売上の105%とする（モック）
  const budgetCells = EXTENDED_PERIODS.map((period) => {
    if (period.monthIndex !== undefined) {
      const total = monthlyTotals[period.monthIndex]
      return { periodId: period.id, value: String(Math.round((total ?? 0) * 1.05)) }
    }
    return { periodId: period.id, value: "0" }
  })

  return { confidenceRows, summaryRow: { totalCells, expectedCells, budgetCells } }
}

// モックデータ: 見込用の行（確度・W/N/B対応）
const salesMonthlyValues = [1000, 1150, 1200, 1100, 1100, 1100, 1200, 1100, 1000, 1100, 1200, 1300]
const salesConfidenceData = createConfidenceRows(salesMonthlyValues)

const cogsMonthlyValues = [600, 680, 700, 650, 650, 650, 700, 650, 600, 650, 700, 750]
const cogsConfidenceData = createConfidenceRows(cogsMonthlyValues)

const mockForecastRows: ForecastRowWithConfidence[] = [
  {
    rowId: "row-sales",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "売上高",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: true, // 確度展開可能
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: createForecastExtendedCells(
      salesMonthlyValues,
      [1000, 1150, null, null, null, null, null, null, null, null, null, null]
    ),
    annualTotal: calcAnnualTotal(salesMonthlyValues),
    // 確度・W/N/B拡張
    isConfidenceEnabled: true,
    isWnbEnabled: true,
    confidenceRows: salesConfidenceData.confidenceRows,
    summaryRow: salesConfidenceData.summaryRow,
  },
  {
    rowId: "row-cogs",
    subjectId: "sub-cogs",
    subjectCode: "2000",
    subjectName: "売上原価",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: true, // 確度展開可能
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: createForecastExtendedCells(
      cogsMonthlyValues,
      [600, 680, null, null, null, null, null, null, null, null, null, null]
    ),
    annualTotal: calcAnnualTotal(cogsMonthlyValues),
    // 確度・W/N/B拡張
    isConfidenceEnabled: true,
    isWnbEnabled: true,
    confidenceRows: cogsConfidenceData.confidenceRows,
    summaryRow: cogsConfidenceData.summaryRow,
  },
  {
    rowId: "row-gross-profit",
    subjectId: "sub-gross-profit",
    subjectCode: "3000",
    subjectName: "売上総利益",
    subjectClass: "AGGREGATE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: false,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
        cells: createForecastExtendedCells(
      [400, 470, 500, 450, 450, 450, 500, 450, 400, 450, 500, 550],
      [400, 470, null, null, null, null, null, null, null, null, null, null]
    ),
    annualTotal: calcAnnualTotal([400, 470, 500, 450, 450, 450, 500, 450, 400, 450, 500, 550]),
  },
  {
    rowId: "row-sga",
    subjectId: "sub-sga",
    subjectCode: "4000",
    subjectName: "販管費",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: createForecastExtendedCells(
      [300, 350, 350, 320, 320, 320, 350, 320, 300, 320, 350, 380],
      [300, 350, null, null, null, null, null, null, null, null, null, null]
    ),
    annualTotal: calcAnnualTotal([300, 350, 350, 320, 320, 320, 350, 320, 300, 320, 350, 380]),
    // W/N/Bのみ有効（確度管理なし）→ W/N/Bアイコンが表示される
    isConfidenceEnabled: false,
    isWnbEnabled: true,
  },
  {
    rowId: "row-operating-profit",
    subjectId: "sub-operating-profit",
    subjectCode: "5000",
    subjectName: "営業利益",
    subjectClass: "AGGREGATE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: false,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
        cells: createForecastExtendedCells(
      [100, 120, 150, 130, 130, 130, 150, 130, 100, 130, 150, 170],
      [100, 120, null, null, null, null, null, null, null, null, null, null]
    ),
    annualTotal: calcAnnualTotal([100, 120, 150, 130, 130, 130, 150, 130, 100, 130, 150, 170]),
  },
]

// モックイベントデータ
const mockEvents: BffForecastEventSummary[] = [
  {
    id: "event-forecast-2026",
    eventCode: "FC2026",
    eventName: "2026年度見込",
    fiscalYear: 2026,
    versionCount: 3,
    latestVersionName: "5月見込第1回",
    latestVersionStatus: "DRAFT",
    wnbStartPeriodNo: 10, // W/N/B 10月開始
    updatedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "event-forecast-2025",
    eventCode: "FC2025",
    eventName: "2025年度見込",
    fiscalYear: 2025,
    versionCount: 12,
    latestVersionName: "3月見込第2回",
    latestVersionStatus: "FIXED",
    wnbStartPeriodNo: null, // W/N/B無し
    updatedAt: "2025-03-25T15:30:00Z",
  },
]

// サマリー計算
function calculateSummary(): BffForecastSummary {
  // 年初来実績（4月+5月）
  const ytdActual = 1000 + 1150 // 売上高の4月+5月
  // 残期間見込（6月〜3月）
  const remainingForecast = 1200 + 1100 + 1100 + 1100 + 1200 + 1100 + 1000 + 1100 + 1200 + 1300
  // 通期見通し
  const fullYearForecast = ytdActual + remainingForecast
  // 通期予算（仮）
  const fullYearBudget = 14000
  // 達成率
  const achievementRate = Math.round((fullYearForecast / fullYearBudget) * 1000) / 10

  return {
    ytdActual: String(ytdActual),
    remainingForecast: String(remainingForecast),
    fullYearForecast: String(fullYearForecast),
    fullYearBudget: String(fullYearBudget),
    achievementRate,
    monthlyAchievement: [
      { periodId: "m4", periodLabel: "4月", cumulative: 7.1, monthly: 100.0 },
      { periodId: "m5", periodLabel: "5月", cumulative: 15.4, monthly: 102.0 },
    ],
  }
}

export class MockForecastBffClient implements ForecastBffClient {
  private rows: BffForecastRow[] = JSON.parse(JSON.stringify(mockForecastRows))
  private events: BffForecastEventSummary[] = JSON.parse(JSON.stringify(mockEvents))

  // ============================================
  // Event Management
  // ============================================

  async listEvents(request: BffListForecastEventsRequest): Promise<BffListForecastEventsResponse> {
    await this.delay(200)

    let items = [...this.events]

    if (request.fiscalYear) {
      items = items.filter((e) => e.fiscalYear === request.fiscalYear)
    }

    if (request.sortBy) {
      items.sort((a, b) => {
        const aVal = a[request.sortBy!]
        const bVal = b[request.sortBy!]
        if (typeof aVal === "string" && typeof bVal === "string") {
          return request.sortOrder === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
        }
        return request.sortOrder === "desc" ? Number(bVal) - Number(aVal) : Number(aVal) - Number(bVal)
      })
    }

    return {
      items,
      totalCount: items.length,
      page: request.page ?? 1,
      pageSize: request.pageSize ?? 20,
    }
  }

  async getEvent(eventId: string): Promise<BffForecastEventDetailResponse> {
    await this.delay(100)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("FORECAST_EVENT_NOT_FOUND")
    }

    return {
      id: event.id,
      eventCode: event.eventCode,
      eventName: event.eventName,
      fiscalYear: event.fiscalYear,
      layoutId: "layout-1",
      layoutName: "標準レイアウト",
      notes: null,
      wnbStartPeriodNo: event.wnbStartPeriodNo,
      createdAt: "2026-04-01T09:00:00Z",
      updatedAt: event.updatedAt,
      versions: [
        {
          id: "version-may-1",
          versionNo: 3,
          versionCode: "FC2026-05-1",
          versionName: "5月見込第1回",
          forecastMonth: 5,
          revisionNo: 1,
          status: "DRAFT",
          fixedAt: null,
        },
        {
          id: "version-apr-2",
          versionNo: 2,
          versionCode: "FC2026-04-2",
          versionName: "4月見込第2回",
          forecastMonth: 4,
          revisionNo: 2,
          status: "FIXED",
          fixedAt: "2026-04-28T18:00:00Z",
        },
        {
          id: "version-apr-1",
          versionNo: 1,
          versionCode: "FC2026-04-1",
          versionName: "4月見込第1回",
          forecastMonth: 4,
          revisionNo: 1,
          status: "FIXED",
          fixedAt: "2026-04-15T17:00:00Z",
        },
      ],
      departments: [
        { id: "dept-sales-1", departmentCode: "S01", departmentName: "営業1課" },
        { id: "dept-sales-2", departmentCode: "S02", departmentName: "営業2課" },
        { id: "dept-dev", departmentCode: "D01", departmentName: "開発部" },
      ],
    }
  }

  async createEvent(request: BffCreateForecastEventRequest): Promise<BffForecastEventResponse> {
    await this.delay(300)

    const newEvent: BffForecastEventSummary = {
      id: `event-${Date.now()}`,
      eventCode: request.eventCode,
      eventName: request.eventName,
      fiscalYear: request.fiscalYear,
      versionCount: 0,
      latestVersionName: "-",
      latestVersionStatus: "DRAFT",
      wnbStartPeriodNo: request.wnbStartPeriodNo ?? null,
      updatedAt: new Date().toISOString(),
    }
    this.events.unshift(newEvent)

    return {
      id: newEvent.id,
      eventCode: newEvent.eventCode,
      eventName: newEvent.eventName,
      fiscalYear: newEvent.fiscalYear,
      layoutId: request.layoutId,
      notes: request.notes ?? null,
      wnbStartPeriodNo: newEvent.wnbStartPeriodNo,
      createdAt: newEvent.updatedAt,
      updatedAt: newEvent.updatedAt,
    }
  }

  async updateEvent(eventId: string, request: BffUpdateForecastEventRequest): Promise<BffForecastEventResponse> {
    await this.delay(200)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("FORECAST_EVENT_NOT_FOUND")
    }

    if (request.eventName) {
      event.eventName = request.eventName
    }
    if (request.wnbStartPeriodNo !== undefined) {
      event.wnbStartPeriodNo = request.wnbStartPeriodNo
    }
    event.updatedAt = new Date().toISOString()

    return {
      id: event.id,
      eventCode: event.eventCode,
      eventName: event.eventName,
      fiscalYear: event.fiscalYear,
      layoutId: "layout-1",
      notes: request.notes ?? null,
      wnbStartPeriodNo: event.wnbStartPeriodNo,
      createdAt: "2026-04-01T09:00:00Z",
      updatedAt: event.updatedAt,
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delay(200)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("FORECAST_EVENT_NOT_FOUND")
    }

    if (event.latestVersionStatus === "FIXED") {
      throw new Error("FORECAST_EVENT_HAS_FIXED_VERSION")
    }

    this.events = this.events.filter((e) => e.id !== eventId)
  }

  async duplicateEvent(eventId: string, newEventCode: string, newEventName: string): Promise<BffForecastEventResponse> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("FORECAST_EVENT_NOT_FOUND")
    }

    const newEvent: BffForecastEventSummary = {
      id: `event-${Date.now()}`,
      eventCode: newEventCode,
      eventName: newEventName,
      fiscalYear: event.fiscalYear,
      versionCount: event.versionCount,
      latestVersionName: event.latestVersionName,
      latestVersionStatus: "DRAFT",
      wnbStartPeriodNo: event.wnbStartPeriodNo,
      updatedAt: new Date().toISOString(),
    }
    this.events.unshift(newEvent)

    return {
      id: newEvent.id,
      eventCode: newEvent.eventCode,
      eventName: newEvent.eventName,
      fiscalYear: newEvent.fiscalYear,
      layoutId: "layout-1",
      notes: null,
      wnbStartPeriodNo: newEvent.wnbStartPeriodNo,
      createdAt: newEvent.updatedAt,
      updatedAt: newEvent.updatedAt,
    }
  }

  // ============================================
  // Version Management
  // ============================================

  async createVersion(eventId: string, request: BffCreateForecastVersionRequest): Promise<BffForecastVersionSummary> {
    await this.delay(300)

    const event = this.events.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("FORECAST_EVENT_NOT_FOUND")
    }

    const revisionNo = request.revisionNo ?? 1
    const monthName = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"][
      request.forecastMonth - 1
    ]

    const newVersion: BffForecastVersionSummary = {
      id: `version-${Date.now()}`,
      versionNo: event.versionCount + 1,
      versionCode: `FC${event.fiscalYear}-${String(request.forecastMonth).padStart(2, "0")}-${revisionNo}`,
      versionName: `${monthName}見込第${revisionNo}回`,
      forecastMonth: request.forecastMonth,
      revisionNo,
      status: "DRAFT",
      fixedAt: null,
    }

    event.versionCount++
    event.latestVersionName = newVersion.versionName
    event.latestVersionStatus = "DRAFT"
    event.updatedAt = new Date().toISOString()

    return newVersion
  }

  // ============================================
  // Grid Operations
  // ============================================

  async getGrid(_request: BffForecastGridRequest): Promise<BffForecastGridResponse> {
    await this.delay(200)

    return {
      context: {
        fiscalYear: 2026,
        departmentId: "dept-sales-1",
        departmentName: "営業1課",
        forecastEventId: "event-forecast-2026",
        forecastEventName: "2026年度見込",
        forecastVersionId: "version-may-1",
        forecastVersionName: "5月見込第1回",
        forecastVersionStatus: "DRAFT",
        forecastMonth: 5,
        revisionNo: 1,
        isEditable: true,
      },
      periods: createForecastPeriods(),
      rows: this.getVisibleRows(),
      summary: calculateSummary(),
    }
  }

  async getContext(): Promise<BffForecastContextResponse> {
    await this.delay(100)

    return {
      fiscalYears: [
        { value: 2026, label: "2026年度" },
        { value: 2025, label: "2025年度" },
      ],
      departments: [
        { id: "dept-sales-1", code: "S01", name: "営業1課" },
        { id: "dept-sales-2", code: "S02", name: "営業2課" },
        { id: "dept-dev", code: "D01", name: "開発部" },
      ],
      forecastEvents: [
        { id: "event-forecast-2026", code: "FC2026", name: "2026年度見込" },
      ],
      forecastVersions: [
        { id: "version-may-1", code: "FC2026-05-1", name: "5月見込第1回", status: "DRAFT", forecastMonth: 5, revisionNo: 1 },
        { id: "version-apr-2", code: "FC2026-04-2", name: "4月見込第2回", status: "FIXED", forecastMonth: 4, revisionNo: 2 },
        { id: "version-apr-1", code: "FC2026-04-1", name: "4月見込第1回", status: "FIXED", forecastMonth: 4, revisionNo: 1 },
      ],
      budgetVersions: [
        { id: "budget-v1", code: "BUD2026-V1", name: "当初予算" },
        { id: "budget-v2", code: "BUD2026-V2", name: "修正予算" },
      ],
    }
  }

  async updateCell(
    _gridRequest: BffForecastGridRequest,
    cellRequest: BffUpdateForecastCellRequest
  ): Promise<BffUpdateForecastCellResponse> {
    await this.delay(300)

    const row = this.rows.find(
      (r) =>
        r.subjectId === cellRequest.subjectId &&
        r.dimensionValueId === (cellRequest.dimensionValueId ?? null)
    )

    if (row) {
      const cellIndex = row.cells.findIndex((c) => c.periodId === cellRequest.periodId)
      if (cellIndex !== -1) {
        row.cells[cellIndex].value = cellRequest.value
        row.annualTotal = this.calcRowTotal(row)
      }
    }

    const affectedRows = this.recalculateAggregates()

    return {
      success: true,
      updatedCell: {
        periodId: cellRequest.periodId,
        value: cellRequest.value,
        isEditable: true,
        isDirty: false,
        monthStatus: "FORECAST",
      },
      affectedRows,
      updatedSummary: calculateSummary(),
    }
  }

  async updateCells(
    gridRequest: BffForecastGridRequest,
    cellsRequest: BffUpdateForecastCellsRequest
  ): Promise<BffUpdateForecastCellsResponse> {
    const updatedCells: BffForecastCell[] = []

    for (const cell of cellsRequest.cells) {
      const result = await this.updateCell(gridRequest, cell)
      updatedCells.push(result.updatedCell)
    }

    const affectedRows = this.recalculateAggregates()

    return {
      success: true,
      updatedCells,
      affectedRows,
      updatedSummary: calculateSummary(),
    }
  }

  // ============================================
  // Comparison
  // ============================================

  async getBudgetCompare(request: BffForecastBudgetCompareRequest): Promise<BffForecastBudgetCompareResponse> {
    await this.delay(300)

    const forecastRows = this.getVisibleRows()
    const periods = createForecastPeriods()

    // 予算データ（モック）
    const budgetMonthlyValues: Record<string, number[]> = {
      "sub-sales": [1100, 1200, 1200, 1150, 1150, 1150, 1200, 1150, 1100, 1150, 1200, 1350],
      "sub-cogs": [650, 700, 700, 680, 680, 680, 700, 680, 650, 680, 700, 780],
      "sub-gross-profit": [450, 500, 500, 470, 470, 470, 500, 470, 450, 470, 500, 570],
      "sub-sga": [320, 360, 360, 340, 340, 340, 360, 340, 320, 340, 360, 400],
      "sub-operating-profit": [130, 140, 140, 130, 130, 130, 140, 130, 130, 130, 140, 170],
    }

    const rows = forecastRows.map((row) => {
      const budgetValues = budgetMonthlyValues[row.subjectId] || Array(12).fill(0)
      const budgetCells = createForecastExtendedCells(budgetValues).map((c) => ({
        periodId: c.periodId,
        value: c.value,
        isEditable: false,
        isDirty: false,
      }))

      const varianceCells = row.cells.map((cell, index) => {
        const forecastValue = parseFloat(cell.value ?? "0") || 0
        const budgetValue = parseFloat(budgetCells[index]?.value ?? "0") || 0
        const variance = forecastValue - budgetValue
        return {
          periodId: cell.periodId,
          value: String(variance),
          isPositive: variance >= 0,
        }
      })

      const forecastTotal = parseFloat(row.annualTotal) || 0
      const budgetTotal = budgetValues.reduce((sum, v) => sum + v, 0)
      const varianceTotal = forecastTotal - budgetTotal

      return {
        rowId: row.rowId,
        subjectId: row.subjectId,
        subjectCode: row.subjectCode,
        subjectName: row.subjectName,
        subjectClass: row.subjectClass,
        indentLevel: row.indentLevel,
        isExpandable: row.isExpandable,
        isExpanded: row.isExpanded,
        parentRowId: row.parentRowId,
        dimensionValueId: row.dimensionValueId,
        dimensionValueName: row.dimensionValueName,
        forecastCells: row.cells,
        forecastAnnualTotal: row.annualTotal,
        budgetCells,
        budgetAnnualTotal: String(budgetTotal),
        varianceCells,
        varianceAnnualTotal: String(varianceTotal),
        varianceAnnualIsPositive: varianceTotal >= 0,
      }
    })

    return {
      context: {
        fiscalYear: request.fiscalYear,
        departmentId: request.departmentId,
        departmentName: "営業1課",
        forecastEventId: request.forecastEventId,
        forecastEventName: "2026年度見込",
        forecastVersionId: request.forecastVersionId,
        forecastVersionName: "5月見込第1回",
        budgetVersionId: request.budgetVersionId,
        budgetVersionName: "当初予算",
      },
      periods,
      rows,
      summary: calculateSummary(),
    }
  }

  async getPreviousCompare(request: BffForecastPreviousCompareRequest): Promise<BffForecastPreviousCompareResponse> {
    await this.delay(300)

    const currentRows = this.getVisibleRows()
    const periods = createForecastPeriods()

    // 前回見込データ（モック：95%の値）
    const rows = currentRows.map((row) => {
      const previousCells = row.cells.map((cell) => ({
        ...cell,
        value: cell.value ? String(Math.round(parseFloat(cell.value) * 0.95)) : null,
      }))

      const varianceCells = row.cells.map((cell, index) => {
        const currentValue = parseFloat(cell.value ?? "0") || 0
        const previousValue = parseFloat(previousCells[index]?.value ?? "0") || 0
        const variance = currentValue - previousValue
        return {
          periodId: cell.periodId,
          value: String(variance),
          isPositive: variance >= 0,
        }
      })

      const currentTotal = parseFloat(row.annualTotal) || 0
      const previousTotal = Math.round(currentTotal * 0.95)
      const varianceTotal = currentTotal - previousTotal

      return {
        rowId: row.rowId,
        subjectId: row.subjectId,
        subjectCode: row.subjectCode,
        subjectName: row.subjectName,
        subjectClass: row.subjectClass,
        indentLevel: row.indentLevel,
        isExpandable: row.isExpandable,
        isExpanded: row.isExpanded,
        parentRowId: row.parentRowId,
        dimensionValueId: row.dimensionValueId,
        dimensionValueName: row.dimensionValueName,
        currentCells: row.cells,
        currentAnnualTotal: row.annualTotal,
        previousCells,
        previousAnnualTotal: String(previousTotal),
        varianceCells,
        varianceAnnualTotal: String(varianceTotal),
        varianceAnnualIsPositive: varianceTotal >= 0,
      }
    })

    return {
      context: {
        fiscalYear: request.fiscalYear,
        departmentId: request.departmentId,
        departmentName: "営業1課",
        forecastEventId: request.forecastEventId,
        forecastEventName: "2026年度見込",
        currentVersionId: request.currentVersionId,
        currentVersionName: "5月見込第1回",
        previousVersionId: request.previousVersionId,
        previousVersionName: "4月見込第2回",
      },
      periods,
      rows,
      summary: calculateSummary(),
    }
  }

  // ============================================
  // Master Data
  // ============================================

  async getSubjects(): Promise<BffSubjectListResponse> {
    await this.delay(100)
    return {
      subjects: [
        { id: "sub-sales", code: "1000", name: "売上高", class: "BASE", hasChildren: false },
        { id: "sub-cogs", code: "2000", name: "売上原価", class: "BASE", hasChildren: false },
        { id: "sub-gross-profit", code: "3000", name: "売上総利益", class: "AGGREGATE", hasChildren: false },
        { id: "sub-sga", code: "4000", name: "販管費", class: "BASE", hasChildren: false },
        { id: "sub-operating-profit", code: "5000", name: "営業利益", class: "AGGREGATE", hasChildren: false },
      ],
    }
  }

  // ============================================
  // Confidence & W/N/B
  // ============================================

  getConfidenceLevels() {
    return DEFAULT_CONFIDENCE_LEVELS.map((level) => ({
      ...level,
      levelNameShort: level.levelCode,
      sortOrder: DEFAULT_CONFIDENCE_LEVELS.indexOf(level) + 1,
      isActive: true,
    }))
  }

  getWnbStartPeriodNo(): number | null {
    // 10月開始（モック）
    return 10
  }

  getRowsWithConfidence(): ForecastRowWithConfidence[] {
    return this.rows as ForecastRowWithConfidence[]
  }

  // ============================================
  // Helper Methods
  // ============================================

  toggleRowExpansion(rowId: string): void {
    const row = this.rows.find((r) => r.rowId === rowId)
    if (row && row.isExpandable) {
      row.isExpanded = !row.isExpanded
    }
  }

  private getVisibleRows(): BffForecastRow[] {
    return this.rows.filter((row) => {
      if (row.parentRowId === null) return true
      const parent = this.rows.find((r) => r.rowId === row.parentRowId)
      return parent?.isExpanded ?? false
    })
  }

  private calcRowTotal(row: BffForecastRow): string {
    // 月次セルのみの合計（集計列は除外）
    const monthPeriodIds = ["m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m1", "m2", "m3"]
    const sum = row.cells
      .filter((c) => monthPeriodIds.includes(c.periodId))
      .reduce((acc, cell) => acc + (parseFloat(cell.value ?? "0") || 0), 0)
    return String(sum)
  }

  private recalculateAggregates(): { rowId: string; cells: BffForecastCell[]; annualTotal: string }[] {
    const affectedRows: { rowId: string; cells: BffForecastCell[]; annualTotal: string }[] = []

    const salesRow = this.rows.find((r) => r.rowId === "row-sales")
    const cogsRow = this.rows.find((r) => r.rowId === "row-cogs")
    const grossProfitRow = this.rows.find((r) => r.rowId === "row-gross-profit")
    const sgaRow = this.rows.find((r) => r.rowId === "row-sga")
    const operatingProfitRow = this.rows.find((r) => r.rowId === "row-operating-profit")

    if (salesRow && cogsRow && grossProfitRow) {
      grossProfitRow.cells = salesRow.cells.map((cell, index) => {
        const sales = parseFloat(cell.value ?? "0") || 0
        const cogs = parseFloat(cogsRow.cells[index]?.value ?? "0") || 0
        return {
          ...cell,
          value: String(sales - cogs),
          isEditable: false,
        }
      })
      grossProfitRow.annualTotal = this.calcRowTotal(grossProfitRow)
      affectedRows.push({
        rowId: grossProfitRow.rowId,
        cells: grossProfitRow.cells,
        annualTotal: grossProfitRow.annualTotal,
      })
    }

    if (grossProfitRow && sgaRow && operatingProfitRow) {
      operatingProfitRow.cells = grossProfitRow.cells.map((cell, index) => {
        const grossProfit = parseFloat(cell.value ?? "0") || 0
        const sga = parseFloat(sgaRow.cells[index]?.value ?? "0") || 0
        return {
          ...cell,
          value: String(grossProfit - sga),
          isEditable: false,
        }
      })
      operatingProfitRow.annualTotal = this.calcRowTotal(operatingProfitRow)
      affectedRows.push({
        rowId: operatingProfitRow.rowId,
        cells: operatingProfitRow.cells,
        annualTotal: operatingProfitRow.annualTotal,
      })
    }

    return affectedRows
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
