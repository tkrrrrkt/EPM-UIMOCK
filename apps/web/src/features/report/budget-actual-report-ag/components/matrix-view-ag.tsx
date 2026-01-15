"use client"

import { useMemo, useCallback, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type {
  ColDef,
  ColGroupDef,
  ValueFormatterParams,
  CellClassParams,
  GridReadyEvent,
  GridApi,
  GetDataPath,
} from "ag-grid-community"
import { Button } from "@/shared/ui/components/button"
import { Download, ChevronRight, Home } from "lucide-react"
import {
  registerAgGridModules,
  AG_GRID_LOCALE_JP,
  formatNumber,
  formatVariance,
} from "./ag-grid-config"

// AG Grid モジュールを登録
registerAgGridModules()

interface MatrixViewAGProps {
  comparisonMode: string
}

// 組織定義
interface OrgNode {
  id: string
  name: string
  parentId?: string
}

const orgNodes: OrgNode[] = [
  { id: "corp", name: "全社" },
  { id: "sales", name: "営業本部", parentId: "corp" },
  { id: "sales-1", name: "第1営業部", parentId: "sales" },
  { id: "sales-2", name: "第2営業部", parentId: "sales" },
  { id: "sales-3", name: "第3営業部", parentId: "sales" },
  { id: "dev", name: "開発本部", parentId: "corp" },
  { id: "dev-1", name: "プロダクト開発部", parentId: "dev" },
  { id: "dev-2", name: "インフラ部", parentId: "dev" },
  { id: "admin", name: "管理本部", parentId: "corp" },
  { id: "finance", name: "財務経理部", parentId: "admin" },
  { id: "hr", name: "人事部", parentId: "admin" },
]

// 行データの型定義
interface MatrixRowData {
  id: string
  accountName: string
  hierarchy: string[]
  [key: string]: string | number | string[] // 動的な組織列用
}

// モックデータ生成
function generateMockData(visibleOrgIds: string[]): MatrixRowData[] {
  const accounts = [
    { id: "revenue", name: "売上高", hierarchy: ["売上高"] },
    { id: "product-sales", name: "製品売上", hierarchy: ["売上高", "製品売上"] },
    { id: "service-sales", name: "サービス売上", hierarchy: ["売上高", "サービス売上"] },
    { id: "cogs", name: "売上原価", hierarchy: ["売上原価"] },
    { id: "gross-profit", name: "売上総利益", hierarchy: ["売上総利益"] },
    { id: "sga", name: "販管費", hierarchy: ["販管費"] },
    { id: "personnel", name: "人件費", hierarchy: ["販管費", "人件費"] },
    { id: "rent", name: "地代家賃", hierarchy: ["販管費", "地代家賃"] },
    { id: "depreciation", name: "減価償却費", hierarchy: ["販管費", "減価償却費"] },
    { id: "operating-profit", name: "営業利益", hierarchy: ["営業利益"] },
  ]

  return accounts.map((account) => {
    const row: MatrixRowData = {
      id: account.id,
      accountName: account.name,
      hierarchy: account.hierarchy,
    }

    // 各組織のデータを生成
    visibleOrgIds.forEach((orgId) => {
      const baseBudget = Math.floor(Math.random() * 50000) + 10000
      const budget = baseBudget
      const actual = Math.floor(budget * (0.9 + Math.random() * 0.2))
      const variance = actual - budget
      const rate = (variance / budget) * 100

      row[`${orgId}_budget`] = budget
      row[`${orgId}_actual`] = actual
      row[`${orgId}_variance`] = variance
      row[`${orgId}_rate`] = rate
    })

    return row
  })
}

export function MatrixViewAG({ comparisonMode: _comparisonMode }: MatrixViewAGProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: "全社" },
  ])

  // 現在の階層の子組織を取得
  const getChildOrgs = useCallback((parentId: string | null): OrgNode[] => {
    if (parentId === null) {
      return orgNodes.filter((org) => org.parentId === "corp")
    }
    return orgNodes.filter((org) => org.parentId === parentId)
  }, [])

  // 現在表示する組織リスト
  const visibleOrgs = useMemo(() => getChildOrgs(currentOrgId), [currentOrgId, getChildOrgs])

  // 合計列用の組織
  const summaryOrg = useMemo(
    () => (currentOrgId ? orgNodes.find((org) => org.id === currentOrgId) : null),
    [currentOrgId]
  )

  // 行データ
  const rowData = useMemo(() => {
    const orgIds = summaryOrg ? [summaryOrg.id, ...visibleOrgs.map((o) => o.id)] : visibleOrgs.map((o) => o.id)
    return generateMockData(orgIds)
  }, [summaryOrg, visibleOrgs])

  // ツリーデータのパス取得関数
  const getDataPath: GetDataPath<MatrixRowData> = useCallback((data) => data.hierarchy, [])

  // 差異列のスタイル
  const varianceCellStyle = useCallback((params: CellClassParams) => {
    const value = params.value as number
    if (value > 0) {
      return { color: "#059669" }
    } else if (value < 0) {
      return { color: "#dc2626" }
    }
    return null
  }, [])

  // 組織列グループを生成
  const createOrgColumnGroup = useCallback(
    (org: OrgNode, isSummary: boolean = false): ColGroupDef => {
      const hasChildren = orgNodes.some((o) => o.parentId === org.id)

      return {
        headerName: isSummary ? `${org.name} 合計` : org.name,
        headerClass: isSummary ? "ag-header-group-cell-center bg-muted" : "ag-header-group-cell-center",
        headerGroupComponent: hasChildren && !isSummary ? "agColumnHeaderGroup" : undefined,
        children: [
          {
            field: `${org.id}_budget`,
            headerName: "予算",
            width: 90,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value),
            cellClass: isSummary ? "bg-muted/30" : undefined,
          },
          {
            field: `${org.id}_actual`,
            headerName: "実績",
            width: 90,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) => formatNumber(params.value),
            cellClass: isSummary ? "bg-muted/30" : undefined,
          },
          {
            field: `${org.id}_variance`,
            headerName: "差異",
            width: 90,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) => formatVariance(params.value),
            cellStyle: varianceCellStyle,
            cellClass: isSummary ? "bg-muted/30" : undefined,
          },
          {
            field: `${org.id}_rate`,
            headerName: "%",
            width: 70,
            type: "numericColumn",
            valueFormatter: (params: ValueFormatterParams) => `${(params.value as number).toFixed(1)}%`,
            cellStyle: varianceCellStyle,
            cellClass: isSummary ? "bg-muted/30" : undefined,
          },
        ],
      }
    },
    [varianceCellStyle]
  )

  // 列定義
  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    const cols: (ColDef | ColGroupDef)[] = []

    // 合計列（ドリルダウンした場合のみ表示）
    if (summaryOrg) {
      cols.push(createOrgColumnGroup(summaryOrg, true))
    }

    // 子組織列
    visibleOrgs.forEach((org) => {
      cols.push(createOrgColumnGroup(org, false))
    })

    return cols
  }, [summaryOrg, visibleOrgs, createOrgColumnGroup])

  // デフォルト列設定
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: true,
    }),
    []
  )

  // 自動グループ列の設定
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

  // グリッド準備完了時
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
    params.api.expandAll()
  }, [])

  // ドリルダウン処理
  const handleDrillDown = useCallback((orgId: string) => {
    const org = orgNodes.find((o) => o.id === orgId)
    if (!org) return

    const hasChildren = orgNodes.some((o) => o.parentId === orgId)
    if (hasChildren) {
      setCurrentOrgId(orgId)
      setBreadcrumbs((prev) => [...prev, { id: orgId, name: org.name }])
    }
  }, [])

  // パンくずクリック処理
  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs((prev) => {
      const newBreadcrumbs = prev.slice(0, index + 1)
      const target = newBreadcrumbs[newBreadcrumbs.length - 1]
      setCurrentOrgId(target.id)
      return newBreadcrumbs
    })
  }, [])

  // Excelエクスポート
  const handleExportExcel = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: `マトリックス分析_${new Date().toISOString().split("T")[0]}.xlsx`,
        sheetName: "マトリックス分析",
      })
    }
  }, [gridApi])

  // ヘッダークリックでドリルダウン（カスタム実装）
  const onColumnHeaderClicked = useCallback(
    (event: any) => {
      const colId = event.column?.getColId()
      if (!colId) return

      // 列IDから組織IDを抽出
      const orgIdMatch = colId.match(/^([^_]+)_/)
      if (orgIdMatch) {
        const orgId = orgIdMatch[1]
        handleDrillDown(orgId)
      }
    },
    [handleDrillDown]
  )

  return (
    <div className="h-full flex flex-col">
      {/* パンくずナビゲーション */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id || "root"} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-foreground transition-colors ${
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="shrink-0 gap-2">
            <Download className="h-4 w-4" />
            Excel出力
          </Button>
        </div>

        {/* ドリルダウン可能な組織一覧 */}
        <div className="flex gap-2 mt-3">
          {visibleOrgs.map((org) => {
            const hasChildren = orgNodes.some((o) => o.parentId === org.id)
            return (
              <Button
                key={org.id}
                variant="outline"
                size="sm"
                onClick={() => handleDrillDown(org.id)}
                disabled={!hasChildren}
                className="gap-1"
              >
                {org.name}
                {hasChildren && <ChevronRight className="h-3 w-3" />}
              </Button>
            )
          })}
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 ag-theme-alpine" style={{ width: "100%", height: "100%" }}>
        <AgGridReact<MatrixRowData>
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
        />
      </div>
    </div>
  )
}
