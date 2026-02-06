'use client'

import { useMemo, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GetDataPath } from 'ag-grid-community'
import {
  registerAgGridModules,
  AG_GRID_LOCALE_JP,
  formatNumber,
} from '@/features/report/budget-actual-report-ag/components/ag-grid-config'
import type { BffAllocationTreeNode } from '@epm/contracts/bff/period-close-status'

// AG-Gridモジュールを登録
registerAgGridModules()

interface AllocationResultGridProps {
  data: BffAllocationTreeNode[]
  height?: number | string
  companyName?: string
  periodLabel?: string
  onExportExcel?: () => void
  onExportCsv?: () => void
}

export function AllocationResultGrid({
  data,
  height = 600,
  companyName,
  periodLabel,
}: AllocationResultGridProps) {
  const gridRef = useRef<AgGridReact<BffAllocationTreeNode>>(null)

  const columnDefs = useMemo<ColDef<BffAllocationTreeNode>[]>(
    () => [
      {
        field: 'fromSubject',
        headerName: '配賦元科目',
        minWidth: 150,
        flex: 1,
        cellClass: (params) => {
          if (params.data?.nodeType === 'EVENT') return 'font-semibold'
          if (params.data?.nodeType === 'STEP') return 'font-medium'
          return ''
        },
      },
      {
        field: 'fromDepartment',
        headerName: '配賦元部門',
        minWidth: 120,
        flex: 1,
      },
      {
        field: 'targetName',
        headerName: '配賦先',
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'toSubject',
        headerName: '配賦先科目',
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'driverType',
        headerName: 'ドライバ',
        minWidth: 100,
        valueFormatter: (params) => {
          const typeLabels: Record<string, string> = {
            FIXED: '固定比率',
            HEADCOUNT: '人数',
            SUBJECT_AMOUNT: '科目金額',
            KPI: 'KPI値',
          }
          return params.value ? typeLabels[params.value] || params.value : ''
        },
      },
      {
        field: 'ratio',
        headerName: '比率',
        minWidth: 80,
        cellClass: 'text-right',
        valueFormatter: (params) =>
          params.value != null ? `${(params.value * 100).toFixed(2)}%` : '',
      },
      {
        field: 'amount',
        headerName: '金額',
        minWidth: 120,
        cellClass: 'text-right font-mono',
        valueFormatter: (params) =>
          params.value != null ? `¥${formatNumber(params.value)}` : '',
      },
    ],
    []
  )

  const autoGroupColumnDef = useMemo<ColDef<BffAllocationTreeNode>>(
    () => ({
      headerName: '配賦内容',
      minWidth: 300,
      flex: 2,
      pinned: 'left',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params: { data?: BffAllocationTreeNode }) => {
          const node = params.data
          if (!node) return ''
          if (node.nodeType === 'EVENT') return node.eventName || ''
          if (node.nodeType === 'STEP') return node.stepName || ''
          return node.targetName || ''
        },
      },
      cellClass: (params) => {
        if (params.data?.nodeType === 'EVENT') return 'font-bold text-foreground'
        if (params.data?.nodeType === 'STEP') return 'font-semibold text-muted-foreground'
        return ''
      },
    }),
    []
  )

  const getDataPath: GetDataPath<BffAllocationTreeNode> = useCallback(
    (data) => data.orgHierarchy,
    []
  )

  const defaultExcelExportParams = useMemo(
    () => ({
      fileName: `配賦結果_${companyName || 'Unknown'}_${periodLabel || ''}.xlsx`,
      sheetName: '配賦結果',
    }),
    [companyName, periodLabel]
  )

  const defaultCsvExportParams = useMemo(
    () => ({
      fileName: `配賦結果_${companyName || 'Unknown'}_${periodLabel || ''}.csv`,
    }),
    [companyName, periodLabel]
  )

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: false,
      filter: false,
      resizable: true,
      suppressMenu: true,
    }),
    []
  )

  // Excel Export function exposed to parent
  const exportExcel = useCallback(() => {
    gridRef.current?.api?.exportDataAsExcel(defaultExcelExportParams)
  }, [defaultExcelExportParams])

  // CSV Export function exposed to parent
  const exportCsv = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv(defaultCsvExportParams)
  }, [defaultCsvExportParams])

  // Expose export functions via ref (can be used by parent)
  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).__allocationGridExport = {
      excel: exportExcel,
      csv: exportCsv,
    }
  }

  return (
    <div
      className="ag-theme-alpine w-full"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <AgGridReact<BffAllocationTreeNode>
        ref={gridRef}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        treeData={true}
        getDataPath={getDataPath}
        groupDefaultExpanded={1}
        localeText={AG_GRID_LOCALE_JP}
        animateRows={false}
        suppressRowClickSelection={true}
        rowSelection="single"
        headerHeight={40}
        rowHeight={36}
        enableRangeSelection={true}
        defaultExcelExportParams={defaultExcelExportParams}
        defaultCsvExportParams={defaultCsvExportParams}
      />
    </div>
  )
}

export default AllocationResultGrid
