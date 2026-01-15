import type { BffClient } from "./BffClient"
import type {
  BffBudgetGridRequest,
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffUpdateCellRequest,
  BffUpdateCellResponse,
  BffUpdateCellsRequest,
  BffUpdateCellsResponse,
  BffBudgetCompareRequest,
  BffBudgetCompareResponse,
  BffBudgetRow,
  BffPeriodColumn,
  BffBudgetCell,
  BffHistoricalActualRequest,
  BffHistoricalActualResponse,
  BffHistoricalActualRow,
  BffSubjectListResponse,
  BffHistoricalCompareRequest,
  BffHistoricalCompareResponse,
  BffHistoricalCompareRow,
} from "@epm/contracts/bff/budget-entry"

// 拡張期間列定義: 4月,5月,6月,1Q,7月,8月,9月,2Q,上期,10月,11月,12月,3Q,1月,2月,3月,4Q,下期,通期
const EXTENDED_PERIODS: Array<{
  id: string
  no: number
  label: string
  type: "MONTH" | "QUARTER" | "HALF" | "ANNUAL"
  isAggregate: boolean
}> = [
  { id: "m4", no: 1, label: "4月", type: "MONTH", isAggregate: false },
  { id: "m5", no: 2, label: "5月", type: "MONTH", isAggregate: false },
  { id: "m6", no: 3, label: "6月", type: "MONTH", isAggregate: false },
  { id: "q1", no: 4, label: "1Q", type: "QUARTER", isAggregate: true },
  { id: "m7", no: 5, label: "7月", type: "MONTH", isAggregate: false },
  { id: "m8", no: 6, label: "8月", type: "MONTH", isAggregate: false },
  { id: "m9", no: 7, label: "9月", type: "MONTH", isAggregate: false },
  { id: "q2", no: 8, label: "2Q", type: "QUARTER", isAggregate: true },
  { id: "h1", no: 9, label: "上期", type: "HALF", isAggregate: true },
  { id: "m10", no: 10, label: "10月", type: "MONTH", isAggregate: false },
  { id: "m11", no: 11, label: "11月", type: "MONTH", isAggregate: false },
  { id: "m12", no: 12, label: "12月", type: "MONTH", isAggregate: false },
  { id: "q3", no: 13, label: "3Q", type: "QUARTER", isAggregate: true },
  { id: "m1", no: 14, label: "1月", type: "MONTH", isAggregate: false },
  { id: "m2", no: 15, label: "2月", type: "MONTH", isAggregate: false },
  { id: "m3", no: 16, label: "3月", type: "MONTH", isAggregate: false },
  { id: "q4", no: 17, label: "4Q", type: "QUARTER", isAggregate: true },
  { id: "h2", no: 18, label: "下期", type: "HALF", isAggregate: true },
  { id: "fy", no: 19, label: "通期", type: "ANNUAL", isAggregate: true },
]

function createPeriods(): BffPeriodColumn[] {
  return EXTENDED_PERIODS.map((p) => ({
    periodId: p.id,
    periodNo: p.no,
    periodLabel: p.label,
    periodType: p.type,
    isOpen: true,
    isEditable: !p.isAggregate, // 集計列は編集不可
    isAggregate: p.isAggregate,
  }))
}

// 月次値から拡張セル（月+Q+上下期+通期）を生成
function createExtendedCells(monthlyValues: (number | null)[]): BffBudgetCell[] {
  // 月次値: [4月, 5月, 6月, 7月, 8月, 9月, 10月, 11月, 12月, 1月, 2月, 3月]
  const q1 = (monthlyValues[0] ?? 0) + (monthlyValues[1] ?? 0) + (monthlyValues[2] ?? 0)
  const q2 = (monthlyValues[3] ?? 0) + (monthlyValues[4] ?? 0) + (monthlyValues[5] ?? 0)
  const h1 = q1 + q2
  const q3 = (monthlyValues[6] ?? 0) + (monthlyValues[7] ?? 0) + (monthlyValues[8] ?? 0)
  const q4 = (monthlyValues[9] ?? 0) + (monthlyValues[10] ?? 0) + (monthlyValues[11] ?? 0)
  const h2 = q3 + q4
  const fy = h1 + h2

  // 拡張期間順にセル生成
  const extendedValues: { id: string; value: number | null; isEditable: boolean }[] = [
    { id: "m4", value: monthlyValues[0], isEditable: true },
    { id: "m5", value: monthlyValues[1], isEditable: true },
    { id: "m6", value: monthlyValues[2], isEditable: true },
    { id: "q1", value: q1, isEditable: false },
    { id: "m7", value: monthlyValues[3], isEditable: true },
    { id: "m8", value: monthlyValues[4], isEditable: true },
    { id: "m9", value: monthlyValues[5], isEditable: true },
    { id: "q2", value: q2, isEditable: false },
    { id: "h1", value: h1, isEditable: false },
    { id: "m10", value: monthlyValues[6], isEditable: true },
    { id: "m11", value: monthlyValues[7], isEditable: true },
    { id: "m12", value: monthlyValues[8], isEditable: true },
    { id: "q3", value: q3, isEditable: false },
    { id: "m1", value: monthlyValues[9], isEditable: true },
    { id: "m2", value: monthlyValues[10], isEditable: true },
    { id: "m3", value: monthlyValues[11], isEditable: true },
    { id: "q4", value: q4, isEditable: false },
    { id: "h2", value: h2, isEditable: false },
    { id: "fy", value: fy, isEditable: false },
  ]

  return extendedValues.map((v) => ({
    periodId: v.id,
    value: v.value !== null ? String(v.value) : null,
    isEditable: v.isEditable,
    isDirty: false,
  }))
}

function calcAnnualTotal(monthlyValues: (number | null)[]): string {
  const sum = monthlyValues.reduce<number>((acc, v) => acc + (v ?? 0), 0)
  return String(sum)
}

// 予算入力用のモックデータ（ディメンション展開を含む）
const mockRows: BffBudgetRow[] = [
  // 売上高（得意先Gディメンションあり）- 親行は自動集計のため編集不可
  {
    rowId: "row-sales",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "売上高",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: true,
    isExpanded: false,
    isEditable: false, // ディメンション持ちの親行は編集不可（子の合計）
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: createExtendedCells([1000, 1200, 1100, 1300, 1400, 1500, 1200, 1100, 1000, 1300, 1400, 1500]),
    annualTotal: calcAnnualTotal([1000, 1200, 1100, 1300, 1400, 1500, 1200, 1100, 1000, 1300, 1400, 1500]),
  },
  {
    rowId: "row-sales-cust-a",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "得意先A",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-sales",
    dimensionValueId: "dim-cust-a",
    dimensionValueName: "得意先A",
    cells: createExtendedCells([400, 500, 450, 550, 600, 650, 500, 450, 400, 550, 600, 650]),
    annualTotal: calcAnnualTotal([400, 500, 450, 550, 600, 650, 500, 450, 400, 550, 600, 650]),
  },
  {
    rowId: "row-sales-cust-b",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "得意先B",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-sales",
    dimensionValueId: "dim-cust-b",
    dimensionValueName: "得意先B",
    cells: createExtendedCells([350, 400, 380, 420, 450, 480, 400, 380, 350, 420, 450, 480]),
    annualTotal: calcAnnualTotal([350, 400, 380, 420, 450, 480, 400, 380, 350, 420, 450, 480]),
  },
  {
    rowId: "row-sales-cust-c",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "得意先C",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-sales",
    dimensionValueId: "dim-cust-c",
    dimensionValueName: "得意先C",
    cells: createExtendedCells([250, 300, 270, 330, 350, 370, 300, 270, 250, 330, 350, 370]),
    annualTotal: calcAnnualTotal([250, 300, 270, 330, 350, 370, 300, 270, 250, 330, 350, 370]),
  },
  // 売上原価（製品群ディメンションあり）
  {
    rowId: "row-cogs",
    subjectId: "sub-cogs",
    subjectCode: "2000",
    subjectName: "売上原価",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: true,
    isExpanded: false,
    isEditable: false, // ディメンション持ちの親行は編集不可
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: createExtendedCells([600, 700, 650, 750, 800, 850, 700, 650, 600, 750, 800, 850]),
    annualTotal: calcAnnualTotal([600, 700, 650, 750, 800, 850, 700, 650, 600, 750, 800, 850]),
  },
  {
    rowId: "row-cogs-prod-x",
    subjectId: "sub-cogs",
    subjectCode: "2000",
    subjectName: "製品X",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-cogs",
    dimensionValueId: "dim-prod-x",
    dimensionValueName: "製品X",
    cells: createExtendedCells([350, 400, 380, 430, 460, 490, 400, 380, 350, 430, 460, 490]),
    annualTotal: calcAnnualTotal([350, 400, 380, 430, 460, 490, 400, 380, 350, 430, 460, 490]),
  },
  {
    rowId: "row-cogs-prod-y",
    subjectId: "sub-cogs",
    subjectCode: "2000",
    subjectName: "製品Y",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-cogs",
    dimensionValueId: "dim-prod-y",
    dimensionValueName: "製品Y",
    cells: createExtendedCells([250, 300, 270, 320, 340, 360, 300, 270, 250, 320, 340, 360]),
    annualTotal: calcAnnualTotal([250, 300, 270, 320, 340, 360, 300, 270, 250, 320, 340, 360]),
  },
  // 売上総利益（集計行）
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
    cells: createExtendedCells([400, 500, 450, 550, 600, 650, 500, 450, 400, 550, 600, 650]),
    annualTotal: calcAnnualTotal([400, 500, 450, 550, 600, 650, 500, 450, 400, 550, 600, 650]),
  },
  // 販管費（ディメンションなし、直接入力）
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
    cells: createExtendedCells([300, 350, 320, 370, 400, 420, 350, 320, 300, 370, 400, 420]),
    annualTotal: calcAnnualTotal([300, 350, 320, 370, 400, 420, 350, 320, 300, 370, 400, 420]),
  },
  // 営業利益（集計行）
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
    cells: createExtendedCells([100, 150, 130, 180, 200, 230, 150, 130, 100, 180, 200, 230]),
    annualTotal: calcAnnualTotal([100, 150, 130, 180, 200, 230, 150, 130, 100, 180, 200, 230]),
  },
]

// 月次値から拡張期間の金額リストを生成
function createExtendedPeriodAmounts(monthlyValues: number[]) {
  const q1 = monthlyValues[0] + monthlyValues[1] + monthlyValues[2]
  const q2 = monthlyValues[3] + monthlyValues[4] + monthlyValues[5]
  const h1 = q1 + q2
  const q3 = monthlyValues[6] + monthlyValues[7] + monthlyValues[8]
  const q4 = monthlyValues[9] + monthlyValues[10] + monthlyValues[11]
  const h2 = q3 + q4
  const fy = h1 + h2

  return [
    { periodId: "m4", periodNo: 1, periodLabel: "4月", value: String(monthlyValues[0]) },
    { periodId: "m5", periodNo: 2, periodLabel: "5月", value: String(monthlyValues[1]) },
    { periodId: "m6", periodNo: 3, periodLabel: "6月", value: String(monthlyValues[2]) },
    { periodId: "q1", periodNo: 4, periodLabel: "1Q", value: String(q1) },
    { periodId: "m7", periodNo: 5, periodLabel: "7月", value: String(monthlyValues[3]) },
    { periodId: "m8", periodNo: 6, periodLabel: "8月", value: String(monthlyValues[4]) },
    { periodId: "m9", periodNo: 7, periodLabel: "9月", value: String(monthlyValues[5]) },
    { periodId: "q2", periodNo: 8, periodLabel: "2Q", value: String(q2) },
    { periodId: "h1", periodNo: 9, periodLabel: "上期", value: String(h1) },
    { periodId: "m10", periodNo: 10, periodLabel: "10月", value: String(monthlyValues[6]) },
    { periodId: "m11", periodNo: 11, periodLabel: "11月", value: String(monthlyValues[7]) },
    { periodId: "m12", periodNo: 12, periodLabel: "12月", value: String(monthlyValues[8]) },
    { periodId: "q3", periodNo: 13, periodLabel: "3Q", value: String(q3) },
    { periodId: "m1", periodNo: 14, periodLabel: "1月", value: String(monthlyValues[9]) },
    { periodId: "m2", periodNo: 15, periodLabel: "2月", value: String(monthlyValues[10]) },
    { periodId: "m3", periodNo: 16, periodLabel: "3月", value: String(monthlyValues[11]) },
    { periodId: "q4", periodNo: 17, periodLabel: "4Q", value: String(q4) },
    { periodId: "h2", periodNo: 18, periodLabel: "下期", value: String(h2) },
    { periodId: "fy", periodNo: 19, periodLabel: "通期", value: String(fy) },
  ]
}

// 過去実績のモックデータ
function createHistoricalData(fiscalYears: number[]): BffHistoricalActualRow[] {
  const subjects = [
    { id: "sub-sales", code: "1000", name: "売上高", class: "BASE" as const, indentLevel: 0 },
    { id: "sub-cogs", code: "2000", name: "売上原価", class: "BASE" as const, indentLevel: 0 },
    { id: "sub-gross-profit", code: "3000", name: "売上総利益", class: "AGGREGATE" as const, indentLevel: 0 },
    { id: "sub-sga", code: "4000", name: "販管費", class: "BASE" as const, indentLevel: 0 },
    { id: "sub-operating-profit", code: "5000", name: "営業利益", class: "AGGREGATE" as const, indentLevel: 0 },
  ]

  // 科目ごとに異なる基準値を設定（月次12ヶ月）
  const subjectBaseValues: Record<string, number[]> = {
    "sub-sales": [1000, 1200, 1100, 1300, 1400, 1500, 1200, 1100, 1000, 1300, 1400, 1500],
    "sub-cogs": [600, 700, 650, 750, 800, 850, 700, 650, 600, 750, 800, 850],
    "sub-gross-profit": [400, 500, 450, 550, 600, 650, 500, 450, 400, 550, 600, 650],
    "sub-sga": [300, 350, 320, 370, 400, 420, 350, 320, 300, 370, 400, 420],
    "sub-operating-profit": [100, 150, 130, 180, 200, 230, 150, 130, 100, 180, 200, 230],
  }

  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    subjectClass: subject.class,
    indentLevel: subject.indentLevel,
    fiscalYearAmounts: fiscalYears.map((year) => {
      // 年度によって異なるモックデータを生成（過去ほど低い）
      const baseMultiplier = year === 2025 ? 0.95 : year === 2024 ? 0.9 : 0.85
      const baseValues = subjectBaseValues[subject.id] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const monthlyValues = baseValues.map((v) => Math.round(v * baseMultiplier))
      const periodAmounts = createExtendedPeriodAmounts(monthlyValues)

      return {
        fiscalYear: year,
        periodAmounts,
        annualTotal: String(monthlyValues.reduce((sum, v) => sum + v, 0)),
      }
    }),
  }))
}

export class MockBffClient implements BffClient {
  private rows: BffBudgetRow[] = JSON.parse(JSON.stringify(mockRows))

  async getGrid(_request: BffBudgetGridRequest): Promise<BffBudgetGridResponse> {
    await this.delay(200)
    return {
      context: {
        fiscalYear: 2026,
        departmentId: "dept-sales-1",
        departmentName: "営業1課",
        planEventId: "event-budget-2026",
        planEventName: "2026年度予算",
        planVersionId: "version-1",
        planVersionName: "第1回",
        planVersionStatus: "DRAFT",
        isEditable: true,
      },
      periods: createPeriods(),
      rows: this.getVisibleRows(),
    }
  }

  async getContext(): Promise<BffBudgetContextResponse> {
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
      planEvents: [
        { id: "event-budget-2026", code: "BUD2026", name: "2026年度予算", scenarioType: "BUDGET" },
      ],
      planVersions: [
        { id: "version-1", code: "V1", name: "第1回", status: "DRAFT" },
        { id: "version-2", code: "V2", name: "第2回", status: "DRAFT" },
      ],
    }
  }

  async updateCell(
    _gridRequest: BffBudgetGridRequest,
    cellRequest: BffUpdateCellRequest
  ): Promise<BffUpdateCellResponse> {
    await this.delay(300)

    const row = this.rows.find(r =>
      r.subjectId === cellRequest.subjectId &&
      r.dimensionValueId === (cellRequest.dimensionValueId ?? null)
    )

    if (row) {
      const cellIndex = row.cells.findIndex(c => c.periodId === cellRequest.periodId)
      if (cellIndex !== -1) {
        row.cells[cellIndex].value = cellRequest.value
        row.annualTotal = this.calcRowTotal(row)
      }
    }

    // ディメンション値の親行を再計算
    this.recalculateDimensionParents()

    const affectedRows = this.recalculateAggregates()

    return {
      success: true,
      updatedCell: {
        periodId: cellRequest.periodId,
        value: cellRequest.value,
        isEditable: true,
        isDirty: false,
      },
      affectedRows,
    }
  }

  async updateCells(
    gridRequest: BffBudgetGridRequest,
    cellsRequest: BffUpdateCellsRequest
  ): Promise<BffUpdateCellsResponse> {
    const updatedCells: BffBudgetCell[] = []

    for (const cell of cellsRequest.cells) {
      const result = await this.updateCell(gridRequest, cell)
      updatedCells.push(result.updatedCell)
    }

    const affectedRows = this.recalculateAggregates()

    return {
      success: true,
      updatedCells,
      affectedRows,
    }
  }

  async getCompare(request: BffBudgetCompareRequest): Promise<BffBudgetCompareResponse> {
    await this.delay(300)

    const baseRows = JSON.parse(JSON.stringify(mockRows)) as BffBudgetRow[]
    const currentRows = this.getVisibleRows()

    return {
      context: {
        fiscalYear: request.fiscalYear,
        departmentId: request.departmentId,
        departmentName: "営業1課",
        planEventId: request.planEventId,
        planEventName: "2026年度予算",
        planVersionId: request.currentVersionId,
        planVersionName: "第2回",
        planVersionStatus: "DRAFT",
        isEditable: true,
      },
      periods: createPeriods(),
      rows: currentRows.map((row, index) => {
        const baseRow = baseRows[index]
        return {
          ...row,
          baseCells: baseRow?.cells ?? row.cells,
          currentCells: row.cells,
          varianceCells: row.cells.map((cell, cellIndex) => {
            const baseValue = parseFloat(baseRow?.cells[cellIndex]?.value ?? "0") || 0
            const currentValue = parseFloat(cell.value ?? "0") || 0
            const variance = currentValue - baseValue
            return {
              periodId: cell.periodId,
              value: String(variance),
              isPositive: variance >= 0,
            }
          }),
        }
      }),
    }
  }

  async getHistoricalActuals(request: BffHistoricalActualRequest): Promise<BffHistoricalActualResponse> {
    await this.delay(200)

    let rows = createHistoricalData(request.fiscalYears)

    // 科目フィルターが指定されている場合
    if (request.subjectIds && request.subjectIds.length > 0) {
      rows = rows.filter(row => request.subjectIds!.includes(row.subjectId))
    }

    return {
      departmentId: request.departmentId,
      departmentName: "営業1課",
      fiscalYears: request.fiscalYears,
      periods: createPeriods(),
      rows,
    }
  }

  async getSubjects(): Promise<BffSubjectListResponse> {
    await this.delay(100)
    return {
      subjects: [
        { id: "sub-sales", code: "1000", name: "売上高", class: "BASE", hasChildren: true },
        { id: "sub-cogs", code: "2000", name: "売上原価", class: "BASE", hasChildren: true },
        { id: "sub-gross-profit", code: "3000", name: "売上総利益", class: "AGGREGATE", hasChildren: false },
        { id: "sub-sga", code: "4000", name: "販管費", class: "BASE", hasChildren: false },
        { id: "sub-operating-profit", code: "5000", name: "営業利益", class: "AGGREGATE", hasChildren: false },
      ],
    }
  }

  async getHistoricalCompare(request: BffHistoricalCompareRequest): Promise<BffHistoricalCompareResponse> {
    await this.delay(300)

    const currentRows = this.getVisibleRows()
    const historicalData = createHistoricalData([request.compareFiscalYear])
    const periods = createPeriods()

    // 現在の予算データと過去実績を比較する行を生成
    const compareRows: BffHistoricalCompareRow[] = currentRows
      // 親行（ディメンション展開の合計行）のみを比較対象にする
      .filter(row => row.parentRowId === null)
      .map(row => {
        const historicalRow = historicalData.find(h => h.subjectId === row.subjectId)
        const historicalYearData = historicalRow?.fiscalYearAmounts.find(
          ya => ya.fiscalYear === request.compareFiscalYear
        )

        // 過去実績のセル（拡張期間列対応）
        const historicalCells: BffBudgetCell[] = periods.map((period) => {
          const histPeriod = historicalYearData?.periodAmounts.find(p => p.periodId === period.periodId)
          return {
            periodId: period.periodId,
            value: histPeriod?.value ?? null,
            isEditable: false,
            isDirty: false,
          }
        })

        // 差異セルの計算
        const varianceCells = row.cells.map((cell, index) => {
          const currentValue = parseFloat(cell.value ?? "0") || 0
          const historicalValue = parseFloat(historicalCells[index]?.value ?? "0") || 0
          const variance = currentValue - historicalValue
          return {
            periodId: cell.periodId,
            value: String(variance),
            isPositive: variance >= 0,
          }
        })

        // 年計の差異
        const currentTotal = parseFloat(row.annualTotal) || 0
        const historicalTotal = parseFloat(historicalYearData?.annualTotal ?? "0") || 0
        const varianceTotal = currentTotal - historicalTotal

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
          historicalCells,
          historicalAnnualTotal: historicalYearData?.annualTotal ?? "0",
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
        planEventId: request.planEventId,
        planEventName: "2026年度予算",
        planVersionId: request.planVersionId,
        planVersionName: "第1回",
        compareFiscalYear: request.compareFiscalYear,
      },
      periods: createPeriods(),
      rows: compareRows,
    }
  }

  toggleRowExpansion(rowId: string): void {
    const row = this.rows.find(r => r.rowId === rowId)
    if (row && row.isExpandable) {
      row.isExpanded = !row.isExpanded
    }
  }

  private getVisibleRows(): BffBudgetRow[] {
    return this.rows.filter(row => {
      if (row.parentRowId === null) return true
      const parent = this.rows.find(r => r.rowId === row.parentRowId)
      return parent?.isExpanded ?? false
    })
  }

  private calcRowTotal(row: BffBudgetRow): string {
    const sum = row.cells.reduce((acc, cell) => {
      return acc + (parseFloat(cell.value ?? "0") || 0)
    }, 0)
    return String(sum)
  }

  // ディメンション値の親行（合計行）を再計算
  private recalculateDimensionParents(): void {
    // 親行を持つ行をグループ化
    const parentRowIds = new Set(this.rows.filter(r => r.parentRowId).map(r => r.parentRowId!))

    parentRowIds.forEach(parentRowId => {
      const parentRow = this.rows.find(r => r.rowId === parentRowId)
      if (!parentRow) return

      const childRows = this.rows.filter(r => r.parentRowId === parentRowId)
      if (childRows.length === 0) return

      // 各期間の合計を計算
      parentRow.cells = parentRow.cells.map((cell, periodIndex) => {
        const sum = childRows.reduce((acc, child) => {
          return acc + (parseFloat(child.cells[periodIndex]?.value ?? "0") || 0)
        }, 0)
        return {
          ...cell,
          value: String(sum),
        }
      })
      parentRow.annualTotal = this.calcRowTotal(parentRow)
    })
  }

  private recalculateAggregates(): { rowId: string; cells: BffBudgetCell[]; annualTotal: string }[] {
    const affectedRows: { rowId: string; cells: BffBudgetCell[]; annualTotal: string }[] = []

    const salesRow = this.rows.find(r => r.rowId === "row-sales")
    const cogsRow = this.rows.find(r => r.rowId === "row-cogs")
    const grossProfitRow = this.rows.find(r => r.rowId === "row-gross-profit")
    const sgaRow = this.rows.find(r => r.rowId === "row-sga")
    const operatingProfitRow = this.rows.find(r => r.rowId === "row-operating-profit")

    if (salesRow && cogsRow && grossProfitRow) {
      grossProfitRow.cells = salesRow.cells.map((cell, index) => {
        const sales = parseFloat(cell.value ?? "0") || 0
        const cogs = parseFloat(cogsRow.cells[index]?.value ?? "0") || 0
        return {
          periodId: cell.periodId,
          value: String(sales - cogs),
          isEditable: false,
          isDirty: false,
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
          periodId: cell.periodId,
          value: String(grossProfit - sga),
          isEditable: false,
          isDirty: false,
        }
      })
      operatingProfitRow.annualTotal = this.calcRowTotal(operatingProfitRow)
      affectedRows.push({
        rowId: operatingProfitRow.rowId,
        cells: operatingProfitRow.cells,
        annualTotal: operatingProfitRow.annualTotal,
      })
    }

    // 親行も affected に追加
    const parentRowIds = new Set(this.rows.filter(r => r.parentRowId).map(r => r.parentRowId!))
    parentRowIds.forEach(parentRowId => {
      const parentRow = this.rows.find(r => r.rowId === parentRowId)
      if (parentRow && !affectedRows.find(ar => ar.rowId === parentRowId)) {
        affectedRows.push({
          rowId: parentRow.rowId,
          cells: parentRow.cells,
          annualTotal: parentRow.annualTotal,
        })
      }
    })

    return affectedRows
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
