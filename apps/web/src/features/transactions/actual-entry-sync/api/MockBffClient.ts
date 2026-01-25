import type { ActualBffClient } from "./BffClient"
import type {
  BffActualGridRequest,
  BffActualGridResponse,
  BffActualContextResponse,
  BffUpdateActualCellRequest,
  BffUpdateActualCellResponse,
  BffUpdateActualCellsRequest,
  BffUpdateActualCellsResponse,
  BffActualBudgetCompareRequest,
  BffActualBudgetCompareResponse,
  BffActualForecastCompareRequest,
  BffActualForecastCompareResponse,
  BffSubjectListResponse,
  BffActualRow,
  BffActualPeriodColumn,
  BffActualCell,
  ActualMonthStatus,
  SourceType,
} from "@epm/contracts/bff/actual-entry"

// 拡張期間列定義
const EXTENDED_PERIODS: Array<{
  id: string
  no: number
  label: string
  type: "MONTH" | "QUARTER" | "HALF" | "ANNUAL"
  isAggregate: boolean
  monthIndex?: number
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

// 現在の月（モック用：6月とする = 4月、5月が確定済み）
const CURRENT_MONTH = 6

// 月の状態を決定（確定/仮締め/入力中/未経過）
function getActualMonthStatus(monthIndex: number): ActualMonthStatus {
  // monthIndex: 0=4月, 1=5月, ...
  const currentMonthIndex = CURRENT_MONTH - 4 // 4月始まりなので

  if (monthIndex < currentMonthIndex - 1) {
    return "HARD_CLOSED" // 確定（前々月以前）
  } else if (monthIndex === currentMonthIndex - 1) {
    return "SOFT_CLOSED" // 仮締め（前月）
  } else if (monthIndex === currentMonthIndex) {
    return "OPEN" // 入力中（当月）
  }
  return "FUTURE" // 未経過
}

function createActualPeriods(): BffActualPeriodColumn[] {
  return EXTENDED_PERIODS.map((p) => {
    let monthStatus: ActualMonthStatus = "FUTURE"
    let isEditable = !p.isAggregate

    if (p.monthIndex !== undefined) {
      monthStatus = getActualMonthStatus(p.monthIndex)
      // 確定月・未経過月は編集不可
      if (monthStatus === "HARD_CLOSED" || monthStatus === "FUTURE") {
        isEditable = false
      }
    }

    return {
      periodId: p.id,
      periodNo: p.no,
      periodLabel: p.label,
      periodType: p.type,
      monthStatus,
      isOpen: monthStatus === "OPEN" || monthStatus === "SOFT_CLOSED",
      isEditable,
      isAggregate: p.isAggregate,
    }
  })
}

// 月次値から拡張セルを生成（実績用）
function createActualExtendedCells(
  monthlyValues: (number | null)[]
): BffActualCell[] {
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
    const monthStatus = v.monthIndex !== undefined ? getActualMonthStatus(v.monthIndex) : "FUTURE"
    const isEditable = v.isEditable && (monthStatus === "OPEN" || monthStatus === "SOFT_CLOSED")

    return {
      periodId: v.id,
      value: v.value !== null ? String(v.value) : null,
      isEditable,
      isDirty: false,
      monthStatus,
    }
  })
}

function calcAnnualTotal(monthlyValues: (number | null)[]): string {
  const sum = monthlyValues.reduce<number>((acc, v) => acc + (v ?? 0), 0)
  return String(sum)
}

// INPUT値とADJUST値からTOTAL値を計算
function calcTotalValues(inputValues: (number | null)[], adjustValues: (number | null)[]): (number | null)[] {
  return inputValues.map((input, i) => {
    const adj = adjustValues[i] ?? 0
    return input !== null ? input + adj : adj !== 0 ? adj : null
  })
}

// モックデータ: 実績用の行（INPUT/ADJUST分離）- TreeGrid用に isExpanded: true
function createMockActualRows(): BffActualRow[] {
  // 各科目のINPUT値（ERP取込）とADJUST値（調整）
  const subjects = [
    {
      id: "sub-sales",
      code: "1000",
      name: "売上高",
      class: "BASE" as const,
      inputValues: [1000, 1150, 1180, null, null, null, null, null, null, null, null, null],
      adjustValues: [0, 0, 20, null, null, null, null, null, null, null, null, null],
    },
    {
      id: "sub-cogs",
      code: "2000",
      name: "売上原価",
      class: "BASE" as const,
      inputValues: [600, 680, 690, null, null, null, null, null, null, null, null, null],
      adjustValues: [0, 0, 10, null, null, null, null, null, null, null, null, null],
    },
    {
      id: "sub-gross-profit",
      code: "3000",
      name: "売上総利益",
      class: "AGGREGATE" as const,
      inputValues: [400, 470, 490, null, null, null, null, null, null, null, null, null],
      adjustValues: [0, 0, 10, null, null, null, null, null, null, null, null, null],
    },
    {
      id: "sub-sga",
      code: "4000",
      name: "販管費",
      class: "BASE" as const,
      inputValues: [300, 350, 360, null, null, null, null, null, null, null, null, null],
      adjustValues: [0, 0, 5, null, null, null, null, null, null, null, null, null],
    },
    {
      id: "sub-operating-profit",
      code: "5000",
      name: "営業利益",
      class: "AGGREGATE" as const,
      inputValues: [100, 120, 130, null, null, null, null, null, null, null, null, null],
      adjustValues: [0, 0, 5, null, null, null, null, null, null, null, null, null],
    },
  ]

  return subjects.map((subject) => {
    const totalValues = calcTotalValues(subject.inputValues, subject.adjustValues)

    return {
      rowId: `row-${subject.id}`,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      subjectClass: subject.class,
      indentLevel: 0,
      isExpandable: false,
      isExpanded: true, // TreeGrid用: 常にexpanded
      isEditable: subject.class !== "AGGREGATE",
      parentRowId: null,
      dimensionValueId: null,
      dimensionValueName: null,
      sourceType: "TOTAL" as SourceType,
      inputRow: {
        cells: createActualExtendedCells(subject.inputValues),
        annualTotal: calcAnnualTotal(subject.inputValues),
      },
      adjustRow: {
        cells: createActualExtendedCells(subject.adjustValues),
        annualTotal: calcAnnualTotal(subject.adjustValues),
      },
      cells: createActualExtendedCells(totalValues),
      annualTotal: calcAnnualTotal(totalValues),
    }
  })
}

export class MockActualBffClient implements ActualBffClient {
  private rows: BffActualRow[] = createMockActualRows()

  async getGrid(_request: BffActualGridRequest): Promise<BffActualGridResponse> {
    await this.delay(200)

    return {
      context: {
        fiscalYear: 2026,
        departmentId: "dept-sales-1",
        departmentName: "営業1課",
        isEditable: true,
        currentMonth: CURRENT_MONTH,
      },
      periods: createActualPeriods(),
      rows: this.rows, // TreeGrid用: 全行を返す
    }
  }

  async getContext(): Promise<BffActualContextResponse> {
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
      budgetVersions: [
        { id: "budget-v1", code: "BUD2026-V1", name: "当初予算" },
        { id: "budget-v2", code: "BUD2026-V2", name: "修正予算" },
      ],
      forecastVersions: [
        { id: "forecast-v1", code: "FC2026-05-1", name: "5月見込第1回" },
        { id: "forecast-v2", code: "FC2026-04-2", name: "4月見込第2回" },
      ],
    }
  }

  async updateCell(
    _gridRequest: BffActualGridRequest,
    cellRequest: BffUpdateActualCellRequest
  ): Promise<BffUpdateActualCellResponse> {
    await this.delay(300)

    const row = this.rows.find(
      (r) =>
        r.subjectId === cellRequest.subjectId &&
        r.dimensionValueId === (cellRequest.dimensionValueId ?? null)
    )

    if (row) {
      // ADJUST行のみ編集可能（INPUTはERP取込なので編集不可）
      if (cellRequest.sourceType === "ADJUST" && row.adjustRow) {
        const cellIndex = row.adjustRow.cells.findIndex((c) => c.periodId === cellRequest.periodId)
        if (cellIndex !== -1) {
          row.adjustRow.cells[cellIndex].value = cellRequest.value
          row.adjustRow.annualTotal = this.calcRowTotal(row.adjustRow.cells)

          // TOTAL行を再計算
          this.recalculateTotalRow(row)
        }
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
        monthStatus: "OPEN",
      },
      affectedRows,
    }
  }

  async updateCells(
    gridRequest: BffActualGridRequest,
    cellsRequest: BffUpdateActualCellsRequest
  ): Promise<BffUpdateActualCellsResponse> {
    const updatedCells: BffActualCell[] = []

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

  async getBudgetCompare(request: BffActualBudgetCompareRequest): Promise<BffActualBudgetCompareResponse> {
    await this.delay(300)

    const actualRows = this.rows
    const periods = createActualPeriods()

    // 予算データ（モック）
    const budgetMonthlyValues: Record<string, number[]> = {
      "sub-sales": [1100, 1200, 1200, 1150, 1150, 1150, 1200, 1150, 1100, 1150, 1200, 1350],
      "sub-cogs": [650, 700, 700, 680, 680, 680, 700, 680, 650, 680, 700, 780],
      "sub-gross-profit": [450, 500, 500, 470, 470, 470, 500, 470, 450, 470, 500, 570],
      "sub-sga": [320, 360, 360, 340, 340, 340, 360, 340, 320, 340, 360, 400],
      "sub-operating-profit": [130, 140, 140, 130, 130, 130, 140, 130, 130, 130, 140, 170],
    }

    const rows = actualRows.map((row) => {
      const budgetValues = budgetMonthlyValues[row.subjectId] || Array(12).fill(0)
      const budgetCells = createActualExtendedCells(budgetValues).map((c) => ({
        periodId: c.periodId,
        value: c.value,
        isEditable: false,
        isDirty: false,
      }))

      const varianceCells = row.cells.map((cell, index) => {
        const actualValue = parseFloat(cell.value ?? "0") || 0
        const budgetValue = parseFloat(budgetCells[index]?.value ?? "0") || 0
        const variance = actualValue - budgetValue
        return {
          periodId: cell.periodId,
          value: String(variance),
          isPositive: variance >= 0,
        }
      })

      const actualTotal = parseFloat(row.annualTotal) || 0
      const budgetTotal = budgetValues.reduce((sum, v) => sum + v, 0)
      const varianceTotal = actualTotal - budgetTotal

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
        actualCells: row.cells,
        actualAnnualTotal: row.annualTotal,
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
        budgetVersionId: request.budgetVersionId,
        budgetVersionName: "当初予算",
      },
      periods,
      rows,
    }
  }

  async getForecastCompare(request: BffActualForecastCompareRequest): Promise<BffActualForecastCompareResponse> {
    await this.delay(300)

    const actualRows = this.rows
    const periods = createActualPeriods()

    // 見込データ（モック）
    const forecastMonthlyValues: Record<string, number[]> = {
      "sub-sales": [1000, 1150, 1200, 1100, 1100, 1100, 1200, 1100, 1000, 1100, 1200, 1300],
      "sub-cogs": [600, 680, 700, 650, 650, 650, 700, 650, 600, 650, 700, 750],
      "sub-gross-profit": [400, 470, 500, 450, 450, 450, 500, 450, 400, 450, 500, 550],
      "sub-sga": [300, 350, 350, 320, 320, 320, 350, 320, 300, 320, 350, 380],
      "sub-operating-profit": [100, 120, 150, 130, 130, 130, 150, 130, 100, 130, 150, 170],
    }

    const rows = actualRows.map((row) => {
      const forecastValues = forecastMonthlyValues[row.subjectId] || Array(12).fill(0)
      const forecastCells = createActualExtendedCells(forecastValues).map((c) => ({
        periodId: c.periodId,
        value: c.value,
        isEditable: false,
        isDirty: false,
      }))

      const varianceCells = row.cells.map((cell, index) => {
        const actualValue = parseFloat(cell.value ?? "0") || 0
        const forecastValue = parseFloat(forecastCells[index]?.value ?? "0") || 0
        const variance = actualValue - forecastValue
        return {
          periodId: cell.periodId,
          value: String(variance),
          isPositive: variance >= 0,
        }
      })

      const actualTotal = parseFloat(row.annualTotal) || 0
      const forecastTotal = forecastValues.reduce((sum, v) => sum + v, 0)
      const varianceTotal = actualTotal - forecastTotal

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
        actualCells: row.cells,
        actualAnnualTotal: row.annualTotal,
        forecastCells,
        forecastAnnualTotal: String(forecastTotal),
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
        forecastVersionId: request.forecastVersionId,
        forecastVersionName: "5月見込第1回",
      },
      periods,
      rows,
    }
  }

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
  // Helper Methods
  // ============================================

  toggleRowExpansion(rowId: string): void {
    const row = this.rows.find((r) => r.rowId === rowId)
    if (row && row.isExpandable) {
      row.isExpanded = !row.isExpanded
    }
  }

  private calcRowTotal(cells: BffActualCell[]): string {
    const monthPeriodIds = ["m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m1", "m2", "m3"]
    const sum = cells
      .filter((c) => monthPeriodIds.includes(c.periodId))
      .reduce((acc, cell) => acc + (parseFloat(cell.value ?? "0") || 0), 0)
    return String(sum)
  }

  private recalculateTotalRow(row: BffActualRow): void {
    if (!row.inputRow || !row.adjustRow) return

    row.cells = row.cells.map((cell) => {
      const inputCell = row.inputRow!.cells.find((c) => c.periodId === cell.periodId)
      const adjustCell = row.adjustRow!.cells.find((c) => c.periodId === cell.periodId)
      const inputValue = parseFloat(inputCell?.value ?? "0") || 0
      const adjustValue = parseFloat(adjustCell?.value ?? "0") || 0
      const total = inputValue + adjustValue

      return {
        ...cell,
        value: total !== 0 || inputCell?.value !== null ? String(total) : null,
      }
    })

    row.annualTotal = this.calcRowTotal(row.cells)
  }

  private recalculateAggregates(): { rowId: string; cells: BffActualCell[]; annualTotal: string }[] {
    const affectedRows: { rowId: string; cells: BffActualCell[]; annualTotal: string }[] = []

    const salesRow = this.rows.find((r) => r.subjectId === "sub-sales")
    const cogsRow = this.rows.find((r) => r.subjectId === "sub-cogs")
    const grossProfitRow = this.rows.find((r) => r.subjectId === "sub-gross-profit")
    const sgaRow = this.rows.find((r) => r.subjectId === "sub-sga")
    const operatingProfitRow = this.rows.find((r) => r.subjectId === "sub-operating-profit")

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
      grossProfitRow.annualTotal = this.calcRowTotal(grossProfitRow.cells)
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
      operatingProfitRow.annualTotal = this.calcRowTotal(operatingProfitRow.cells)
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
