"use client"

import { useMemo, useCallback, useEffect, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type {
  ColDef,
  ColGroupDef,
  GetDataPath,
  ValueFormatterParams,
  CellClassParams,
  GridReadyEvent,
  GridApi,
} from "ag-grid-community"
import { Button } from "@/shared/ui/components/button"
import { Percent, Download } from "lucide-react"
import {
  registerAgGridModules,
  AG_GRID_LOCALE_JP,
  formatNumber,
  formatVariance,
} from "./ag-grid-config"

// AG Grid モジュールを登録
registerAgGridModules()

export type ComparisonMode = "budget" | "previous" | "priorYear"

interface ReportDataGridAGProps {
  organizationId: string | null
  comparisonMode: ComparisonMode
}

// 行データの型定義（フラット構造でツリーパスを持つ）
interface AccountRowData {
  id: string
  accountName: string
  hierarchy: string[] // ツリーパス（例: ["売上高"] or ["売上高", "製品売上"]）
  // 各月のデータ
  M01_budget: number
  M01_actual: number
  M01_variance: number
  M01_rate: number
  M02_budget: number
  M02_actual: number
  M02_variance: number
  M02_rate: number
  M03_budget: number
  M03_actual: number
  M03_variance: number
  M03_rate: number
  M04_budget: number
  M04_actual: number
  M04_variance: number
  M04_rate: number
  M05_budget: number
  M05_actual: number
  M05_variance: number
  M05_rate: number
  M06_budget: number
  M06_actual: number
  M06_variance: number
  M06_rate: number
  M07_budget: number
  M07_actual: number
  M07_variance: number
  M07_rate: number
  M08_budget: number
  M08_actual: number
  M08_variance: number
  M08_rate: number
  M09_budget: number
  M09_actual: number
  M09_variance: number
  M09_rate: number
  M10_budget: number
  M10_actual: number
  M10_variance: number
  M10_rate: number
  M11_budget: number
  M11_actual: number
  M11_variance: number
  M11_rate: number
  M12_budget: number
  M12_actual: number
  M12_variance: number
  M12_rate: number
  // 年間合計
  annual_budget: number
  annual_actual: number
  annual_variance: number
  annual_rate: number
}

// モックデータ生成
function generateMockData(): AccountRowData[] {
  const currentMonth = 6 // 6月まで実績確定

  const createMonthData = (baseBudget: number, index: number, currentMonthNum: number) => {
    const budget = baseBudget + (index % 3) * 500
    const actual = index < currentMonthNum ? Math.floor(budget * (0.9 + Math.random() * 0.2)) : 0
    const variance = actual > 0 ? actual - budget : 0
    const rate = budget > 0 ? (variance / budget) * 100 : 0
    return { budget, actual, variance, rate }
  }

  const createRowData = (
    id: string,
    name: string,
    hierarchy: string[],
    baseBudget: number
  ): AccountRowData => {
    const months = Array.from({ length: 12 }, (_, i) => createMonthData(baseBudget, i, currentMonth))
    const annualBudget = months.reduce((sum, m) => sum + m.budget, 0)
    const annualActual = months.reduce((sum, m) => sum + m.actual, 0)
    const annualVariance = annualActual - annualBudget
    const annualRate = annualBudget > 0 ? (annualVariance / annualBudget) * 100 : 0

    return {
      id,
      accountName: name,
      hierarchy,
      M01_budget: months[0].budget,
      M01_actual: months[0].actual,
      M01_variance: months[0].variance,
      M01_rate: months[0].rate,
      M02_budget: months[1].budget,
      M02_actual: months[1].actual,
      M02_variance: months[1].variance,
      M02_rate: months[1].rate,
      M03_budget: months[2].budget,
      M03_actual: months[2].actual,
      M03_variance: months[2].variance,
      M03_rate: months[2].rate,
      M04_budget: months[3].budget,
      M04_actual: months[3].actual,
      M04_variance: months[3].variance,
      M04_rate: months[3].rate,
      M05_budget: months[4].budget,
      M05_actual: months[4].actual,
      M05_variance: months[4].variance,
      M05_rate: months[4].rate,
      M06_budget: months[5].budget,
      M06_actual: months[5].actual,
      M06_variance: months[5].variance,
      M06_rate: months[5].rate,
      M07_budget: months[6].budget,
      M07_actual: months[6].actual,
      M07_variance: months[6].variance,
      M07_rate: months[6].rate,
      M08_budget: months[7].budget,
      M08_actual: months[7].actual,
      M08_variance: months[7].variance,
      M08_rate: months[7].rate,
      M09_budget: months[8].budget,
      M09_actual: months[8].actual,
      M09_variance: months[8].variance,
      M09_rate: months[8].rate,
      M10_budget: months[9].budget,
      M10_actual: months[9].actual,
      M10_variance: months[9].variance,
      M10_rate: months[9].rate,
      M11_budget: months[10].budget,
      M11_actual: months[10].actual,
      M11_variance: months[10].variance,
      M11_rate: months[10].rate,
      M12_budget: months[11].budget,
      M12_actual: months[11].actual,
      M12_variance: months[11].variance,
      M12_rate: months[11].rate,
      annual_budget: annualBudget,
      annual_actual: annualActual,
      annual_variance: annualVariance,
      annual_rate: annualRate,
    }
  }

  return [
    // 売上高（親）
    createRowData("revenue", "売上高", ["売上高"], 10000),
    // 製品売上（子）
    createRowData("product-sales", "製品売上", ["売上高", "製品売上"], 7000),
    // サービス売上（子）
    createRowData("service-sales", "サービス売上", ["売上高", "サービス売上"], 3000),
    // 売上原価（親）
    createRowData("cogs", "売上原価", ["売上原価"], 4000),
    // 販管費（親）
    createRowData("sga", "販管費", ["販管費"], 3000),
    // 人件費（子）
    createRowData("personnel", "人件費", ["販管費", "人件費"], 2000),
    // 地代家賃（子）
    createRowData("rent", "地代家賃", ["販管費", "地代家賃"], 500),
    // 営業利益
    createRowData("operating-profit", "営業利益", ["営業利益"], 3000),
  ]
}

export function ReportDataGridAG({ organizationId, comparisonMode }: ReportDataGridAGProps) {
  const [showRates, setShowRates] = useState(false)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)

  // 行データ
  const rowData = useMemo(() => generateMockData(), [])

  // ツリーデータのパス取得関数
  const getDataPath: GetDataPath<AccountRowData> = useCallback((data) => data.hierarchy, [])

  // 差異列のスタイル（正/負で色分け）
  const varianceCellStyle = useCallback((params: CellClassParams) => {
    const value = params.value as number
    if (value > 0) {
      return { color: "#059669" } // emerald-600
    } else if (value < 0) {
      return { color: "#dc2626" } // destructive (red)
    }
    return null
  }, [])

  // 月次列グループを生成する関数
  const createMonthColumnGroup = useCallback(
    (monthKey: string, monthLabel: string): ColGroupDef => ({
      headerName: monthLabel,
      headerClass: "ag-header-group-cell-center",
      children: [
        {
          field: `${monthKey}_budget`,
          headerName: "予算",
          width: 90,
          type: "numericColumn",
          valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value),
        },
        {
          field: `${monthKey}_actual`,
          headerName: "実績",
          width: 90,
          type: "numericColumn",
          valueFormatter: (params: ValueFormatterParams) =>
            params.value > 0 ? formatNumber(params.value) : "-",
        },
        {
          field: `${monthKey}_variance`,
          headerName: "差異",
          width: 90,
          type: "numericColumn",
          valueFormatter: (params: ValueFormatterParams) =>
            params.value !== 0 ? formatVariance(params.value) : "-",
          cellStyle: varianceCellStyle,
        },
        ...(showRates
          ? [
              {
                field: `${monthKey}_rate`,
                headerName: "%",
                width: 70,
                type: "numericColumn",
                valueFormatter: (params: ValueFormatterParams) =>
                  params.value !== 0 ? `${params.value.toFixed(1)}%` : "-",
                cellStyle: varianceCellStyle,
              } as ColDef,
            ]
          : []),
      ],
    }),
    [showRates, varianceCellStyle]
  )

  // 列定義
  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    const months = [
      { key: "M01", label: "1月" },
      { key: "M02", label: "2月" },
      { key: "M03", label: "3月" },
      { key: "M04", label: "4月" },
      { key: "M05", label: "5月" },
      { key: "M06", label: "6月" },
      { key: "M07", label: "7月" },
      { key: "M08", label: "8月" },
      { key: "M09", label: "9月" },
      { key: "M10", label: "10月" },
      { key: "M11", label: "11月" },
      { key: "M12", label: "12月" },
    ]

    return [
      // 年間合計列グループ
      {
        headerName: "年間合計",
        headerClass: "ag-header-group-cell-center bg-muted",
        children: [
          {
            field: "annual_budget",
            headerName: "予算",
            width: 100,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value),
            cellClass: "bg-muted/30",
          },
          {
            field: "annual_actual",
            headerName: "実績",
            width: 100,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) =>
              params.value > 0 ? formatNumber(params.value) : "-",
            cellClass: "bg-muted/30",
          },
          {
            field: "annual_variance",
            headerName: "差異",
            width: 100,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) =>
              params.value !== 0 ? formatVariance(params.value) : "-",
            cellStyle: varianceCellStyle,
            cellClass: "bg-muted/30",
          },
          ...(showRates
            ? [
                {
                  field: "annual_rate",
                  headerName: "%",
                  width: 80,
                  type: "numericColumn",
                  valueFormatter: (params: ValueFormatterParams) =>
                    params.value !== 0 ? `${params.value.toFixed(1)}%` : "-",
                  cellStyle: varianceCellStyle,
                  cellClass: "bg-muted/30",
                } as ColDef,
              ]
            : []),
        ],
      } as ColGroupDef,
      // 各月の列グループ
      ...months.map((m) => createMonthColumnGroup(m.key, m.label)),
    ]
  }, [showRates, createMonthColumnGroup, varianceCellStyle])

  // デフォルト列設定
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: true,
    }),
    []
  )

  // 自動グループ列の設定（科目名を表示）
  // Note: AG Grid v35では型が厳密になったためanyでキャスト
  const autoGroupColumnDef = useMemo(
    () => ({
      headerName: "科目",
      width: 200,
      pinned: "left" as const,
      cellRendererParams: {
        suppressCount: true,
      },
    }),
    []
  )

  // グリッド準備完了時のコールバック
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
    // 初期状態ですべて展開
    params.api.expandAll()
  }, [])

  // Excelエクスポート
  const handleExportExcel = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: `予算実績比較_${new Date().toISOString().split("T")[0]}.xlsx`,
        sheetName: "予算実績比較",
      })
    }
  }, [gridApi])

  // 率表示切替時にグリッドを再描画
  useEffect(() => {
    if (gridApi) {
      gridApi.refreshCells({ force: true })
    }
  }, [showRates, gridApi])

  return (
    <div className="h-full flex flex-col">
      {/* サマリーカード + アクションボタン */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-start gap-4 mb-0">
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">通期予算</div>
              <div className="text-xl font-semibold tabular-nums">¥138,000</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">実績+見込</div>
              <div className="text-xl font-semibold tabular-nums">¥135,520</div>
              <div className="text-xs text-destructive mt-1">-1.8%</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">前回見込</div>
              <div className="text-xl font-semibold tabular-nums">¥133,160</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1">前回比</div>
              <div className="text-xl font-semibold text-emerald-600 tabular-nums">+¥2,360</div>
              <div className="text-xs text-emerald-600 mt-1">+1.8%</div>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant={showRates ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRates(!showRates)}
              className="shrink-0 gap-2"
            >
              <Percent className="h-4 w-4" />
              率表示
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="shrink-0 gap-2">
              <Download className="h-4 w-4" />
              Excel出力
            </Button>
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 ag-theme-alpine" style={{ width: "100%", height: "100%" }}>
        <AgGridReact<AccountRowData>
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          treeData={true}
          getDataPath={getDataPath}
          groupDefaultExpanded={-1}
          onGridReady={onGridReady}
          localeText={AG_GRID_LOCALE_JP}
          animateRows={true}
          suppressRowClickSelection={true}
          rowSelection="single"
          enableRangeSelection={true}
          suppressCopyRowsToClipboard={false}
        />
      </div>
    </div>
  )
}
