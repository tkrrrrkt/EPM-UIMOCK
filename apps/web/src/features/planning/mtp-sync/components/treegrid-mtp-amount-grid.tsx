"use client"

import { useMemo, useRef, useCallback } from "react"
import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Freeze,
  Resize,
} from "@syncfusion/ej2-react-treegrid"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui"
import { formatAmount } from "../utils/format"
import type { BffMtpAmountsResponse } from "@epm/contracts/bff/mtp"

interface TreeGridMtpAmountGridProps {
  eventId: string
  dimensionValueId: string
  data: BffMtpAmountsResponse
  onAmountChange: (subjectId: string, fiscalYear: number, amount: string) => void
}

interface GridRow {
  id: string
  parentId: string | null
  subjectId: string
  subjectName: string
  isAggregate: boolean
  isExpanded: boolean
  [key: string]: string | number | boolean | null
}

export function TreeGridMtpAmountGrid({
  eventId,
  dimensionValueId,
  data,
  onAmountChange,
}: TreeGridMtpAmountGridProps) {
  const treeGridRef = useRef<TreeGridComponent | null>(null)
  const saveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Transform data to TreeGrid format
  const gridData = useMemo(() => {
    const rows: GridRow[] = []

    data.subjects.forEach((subject) => {
      const row: GridRow = {
        id: subject.id,
        parentId: null,
        subjectId: subject.id,
        subjectName: subject.subjectName,
        isAggregate: subject.isAggregate,
        isExpanded: true,
      }

      // Add amount columns (actual and plan)
      data.columns.forEach((col) => {
        const cell = data.amounts.find(
          (a) => a.subjectId === subject.id && a.fiscalYear === col.fiscalYear && a.isActual === col.isActual
        )
        const key = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`
        row[key] = cell?.amount || "0"
      })

      // Calculate plan total
      const planTotal = data.columns
        .filter((c) => !c.isActual)
        .reduce((sum, col) => {
          const cell = data.amounts.find(
            (a) => a.subjectId === subject.id && a.fiscalYear === col.fiscalYear && !a.isActual
          )
          return sum + Number(cell?.amount || 0)
        }, 0)
      row.planTotal = String(planTotal)

      rows.push(row)
    })

    return rows
  }, [data])

  // Generate columns
  const columns = useMemo(() => {
    const cols: Array<{
      field: string
      headerText: string
      subHeaderText?: string
      isActual: boolean
      fiscalYear?: number
      width: number
      textAlign: string
      allowEditing: boolean
    }> = []

    // Actual columns
    data.columns
      .filter((c) => c.isActual)
      .forEach((col) => {
        cols.push({
          field: `actual_${col.fiscalYear}`,
          headerText: `FY${col.fiscalYear}`,
          subHeaderText: "実績",
          isActual: true,
          fiscalYear: col.fiscalYear,
          width: 120,
          textAlign: "Right",
          allowEditing: false,
        })
      })

    // Plan columns
    data.columns
      .filter((c) => !c.isActual)
      .forEach((col) => {
        cols.push({
          field: `plan_${col.fiscalYear}`,
          headerText: `FY${col.fiscalYear}`,
          subHeaderText: "計画",
          isActual: false,
          fiscalYear: col.fiscalYear,
          width: 130,
          textAlign: "Right",
          allowEditing: !data.isReadOnly,
        })
      })

    return cols
  }, [data.columns, data.isReadOnly])

  // Handle cell edit
  const handleCellSave = useCallback(
    (args: { rowData: GridRow; columnName: string; value: unknown }) => {
      const { rowData, columnName, value } = args

      // Only process plan columns
      if (!columnName.startsWith("plan_") || rowData.isAggregate) {
        return
      }

      const fiscalYear = parseInt(columnName.replace("plan_", ""), 10)
      const amount = String(value || "0")
      const key = `${rowData.subjectId}-${fiscalYear}`

      // Clear existing timeout
      const existingTimeout = saveTimeoutRef.current.get(key)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Debounce save
      const timeout = setTimeout(() => {
        onAmountChange(rowData.subjectId, fiscalYear, amount)
        saveTimeoutRef.current.delete(key)
      }, 200)

      saveTimeoutRef.current.set(key, timeout)
    },
    [onAmountChange]
  )

  // Format cell value
  const formatCellValue = useCallback((field: string, value: unknown): string => {
    if (value === null || value === undefined) return "-"
    return formatAmount(String(value))
  }, [])

  // Query cell info for styling
  const queryCellInfo = useCallback(
    (args: { column: { field: string }; cell: HTMLElement; data: GridRow }) => {
      const { column, cell, data: rowData } = args
      const field = column.field

      // Aggregate row styling
      if (rowData.isAggregate) {
        cell.classList.add("mtp-aggregate-row")
      }

      // Actual column styling
      if (field.startsWith("actual_")) {
        cell.classList.add("mtp-actual-cell")
      }

      // Plan total column styling
      if (field === "planTotal") {
        cell.classList.add("mtp-total-cell")
      }
    },
    []
  )

  const editSettings = {
    allowEditing: !data.isReadOnly,
    mode: "Batch" as const,
    allowEditOnDblClick: true,
  }

  return (
    <Card className="mtp-treegrid-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>数値入力グリッド (TreeGrid)</span>
          {data.isReadOnly && (
            <span className="text-sm font-normal text-muted-foreground">（読み取り専用）</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <TreeGridComponent
          ref={treeGridRef}
          dataSource={gridData}
          idMapping="id"
          parentIdMapping="parentId"
          treeColumnIndex={0}
          allowResizing={true}
          editSettings={editSettings}
          frozenColumns={1}
          height="auto"
          rowHeight={40}
          queryCellInfo={queryCellInfo}
          cellSave={(args) => handleCellSave(args as { rowData: GridRow; columnName: string; value: unknown })}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="subjectName"
              headerText="科目"
              width={200}
              textAlign="Left"
              allowEditing={false}
              freeze="Left"
            />
            {columns.map((col) => (
              <ColumnDirective
                key={col.field}
                field={col.field}
                headerText={col.headerText}
                width={col.width}
                textAlign={col.textAlign as "Left" | "Right" | "Center" | "Justify"}
                allowEditing={col.allowEditing}
                format="N0"
                template={(props: GridRow) => (
                  <span className="tabular-nums">{formatCellValue(col.field, props[col.field])}</span>
                )}
              />
            ))}
            <ColumnDirective
              field="planTotal"
              headerText="計画合計"
              width={140}
              textAlign="Right"
              allowEditing={false}
              template={(props: GridRow) => (
                <span className="tabular-nums font-semibold">{formatCellValue("planTotal", props.planTotal)}</span>
              )}
            />
          </ColumnsDirective>
          <Inject services={[Edit, Freeze, Resize]} />
        </TreeGridComponent>
      </CardContent>
    </Card>
  )
}
