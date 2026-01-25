"use client"

import * as React from "react"
import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Freeze,
  Selection,
} from "@syncfusion/ej2-react-treegrid"
import { Card } from "@/shared/ui"
import type {
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
} from "@epm/contracts/bff/budget-guideline"
import { cn } from "@/lib/utils"

// ============================================
// Types
// ============================================

interface TreeGridRow {
  id: string
  parentId: string | null
  subjectId: string
  subjectCode: string
  subjectName: string
  sortOrder: number
  isAggregate: boolean
  [key: string]: string | number | boolean | null
}

interface TreeGridAmountGridProps {
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  guidelineAmounts: BffGuidelineAmountCell[]
  actualsYears: number[]
  actualsAmounts: BffActualCell[]
  isReadOnly: boolean
  onAmountChange: (subjectId: string, periodKey: string, amount: string) => void
}

// ============================================
// Component
// ============================================

export function TreeGridAmountGrid({
  subjects,
  guidelinePeriods,
  guidelineAmounts,
  actualsYears,
  actualsAmounts,
  isReadOnly,
  onAmountChange,
}: TreeGridAmountGridProps) {
  const treeGridRef = React.useRef<TreeGridComponent>(null)
  const saveTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})
  const [localData, setLocalData] = React.useState<TreeGridRow[]>([])

  // Convert to TreeGrid data format
  const convertToTreeGridData = React.useCallback((): TreeGridRow[] => {
    return subjects.map((subject) => {
      const row: TreeGridRow = {
        id: subject.id,
        parentId: null,
        subjectId: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        sortOrder: subject.sortOrder,
        isAggregate: subject.isAggregate,
      }

      // Add actual year columns
      actualsYears.forEach((year) => {
        const actualCell = actualsAmounts.find(
          (a) => a.subjectId === subject.id && a.fiscalYear === year
        )
        row[`actual_${year}`] = actualCell?.amount ?? null
      })

      // Add guideline period columns
      guidelinePeriods.forEach((period) => {
        const guidelineCell = guidelineAmounts.find(
          (a) => a.subjectId === subject.id && a.periodKey === period.key
        )
        row[`guideline_${period.key}`] = guidelineCell?.amount ?? null
      })

      return row
    })
  }, [subjects, actualsYears, actualsAmounts, guidelinePeriods, guidelineAmounts])

  React.useEffect(() => {
    setLocalData(convertToTreeGridData())
  }, [convertToTreeGridData])

  // Format amount for display
  const formatAmount = (value: string | number | null): string => {
    if (value === null || value === "") return "-"
    const num = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(num)) return String(value)
    return num.toLocaleString("ja-JP")
  }

  // Cell template for actual columns
  const actualCellTemplate = (year: number) => (props: TreeGridRow) => {
    const value = props[`actual_${year}`]
    return (
      <div className="text-right font-mono text-sm text-muted-foreground">
        {formatAmount(value as string | null)}
      </div>
    )
  }

  // Cell template for guideline columns
  const guidelineCellTemplate = (periodKey: string) => (props: TreeGridRow) => {
    const value = props[`guideline_${periodKey}`]
    return (
      <div
        className={cn(
          "text-right font-mono text-sm",
          props.isAggregate && "font-semibold"
        )}
      >
        {formatAmount(value as string | null)}
      </div>
    )
  }

  // Subject column template
  const subjectTemplate = (props: TreeGridRow) => (
    <div
      className={cn(
        "font-medium",
        props.isAggregate && "font-semibold text-muted-foreground"
      )}
    >
      {props.isAggregate ? `【${props.subjectName}】` : props.subjectName}
    </div>
  )

  // Handle cell edit
  const handleCellEdit = async (args: {
    rowData: TreeGridRow
    columnName: string
    value: string
    previousValue: string
  }) => {
    const { rowData, columnName, value, previousValue } = args

    if (value === previousValue) return

    // Extract period key from column name
    const guidelineMatch = columnName.match(/^guideline_(.+)$/)
    if (!guidelineMatch) return

    const periodKey = guidelineMatch[1]
    const cellKey = `${rowData.subjectId}:${periodKey}`

    // Clear existing timeout
    if (saveTimeoutRef.current[cellKey]) {
      clearTimeout(saveTimeoutRef.current[cellKey])
    }

    // Debounce save
    saveTimeoutRef.current[cellKey] = setTimeout(() => {
      onAmountChange(rowData.subjectId, periodKey, value === "" ? "0" : value)
    }, 200)
  }

  // Cell editing event handler
  const actionComplete = (args: { requestType: string; data?: TreeGridRow; cell?: HTMLElement }) => {
    if (args.requestType === "save" && args.data) {
      const treeGridInstance = treeGridRef.current
      if (!treeGridInstance) return

      const editedColumn = (treeGridInstance as TreeGridComponent & { editModule?: { editCellIndex?: number } })
        .editModule?.editCellIndex
      if (editedColumn === undefined) return

      const columns = treeGridInstance.columns
      if (!columns || editedColumn >= columns.length) return

      const column = columns[editedColumn] as { field?: string }
      const columnName = column?.field
      if (!columnName) return

      const previousValue = args.cell?.innerText ?? ""
      const currentValue = (args.data[columnName] as string) ?? ""

      handleCellEdit({
        rowData: args.data,
        columnName,
        value: currentValue,
        previousValue,
      })
    }
  }

  // Query cell info for styling
  const queryCellInfo = (args: { column?: { field?: string }; cell?: HTMLElement; data?: TreeGridRow }) => {
    if (!args.column?.field || !args.cell || !args.data) return

    // Style for aggregate rows
    if (args.data.isAggregate) {
      args.cell.classList.add("treegrid-aggregate-row")
    }

    // Style for actual columns (read-only background)
    if (args.column.field.startsWith("actual_")) {
      args.cell.classList.add("treegrid-actual-column")
    }

    // Style for guideline columns
    if (args.column.field.startsWith("guideline_")) {
      args.cell.classList.add("treegrid-guideline-column")
    }
  }

  // Row styling
  const rowDataBound = (args: { row?: HTMLElement; data?: TreeGridRow }) => {
    if (!args.row || !args.data) return

    if (args.data.isAggregate) {
      args.row.classList.add("treegrid-aggregate-row")
    }
  }

  // Edit settings
  const editSettings = {
    allowEditing: !isReadOnly,
    mode: "Cell" as const,
    showConfirmDialog: false,
  }

  return (
    <Card className="overflow-hidden">
      <TreeGridComponent
        ref={treeGridRef}
        dataSource={localData}
        idMapping="id"
        parentIdMapping="parentId"
        treeColumnIndex={0}
        allowSelection={true}
        editSettings={editSettings}
        actionComplete={actionComplete}
        queryCellInfo={queryCellInfo}
        rowDataBound={rowDataBound}
        frozenColumns={1}
        height="400px"
        enableCollapseAll={false}
      >
        <ColumnsDirective>
          {/* Subject column */}
          <ColumnDirective
            field="subjectName"
            headerText="科目"
            width="180"
            template={subjectTemplate}
            allowEditing={false}
            freeze="Left"
          />

          {/* Actual year columns */}
          {actualsYears.map((year) => (
            <ColumnDirective
              key={`actual_${year}`}
              field={`actual_${year}`}
              headerText={`FY${year}`}
              headerTemplate={() => (
                <div className="text-right">
                  <div>FY{year}</div>
                  <div className="text-xs font-normal text-muted-foreground">(実績)</div>
                </div>
              )}
              template={actualCellTemplate(year)}
              width="100"
              textAlign="Right"
              allowEditing={false}
            />
          ))}

          {/* Guideline period columns */}
          {guidelinePeriods.map((period) => (
            <ColumnDirective
              key={`guideline_${period.key}`}
              field={`guideline_${period.key}`}
              headerText={period.label}
              headerTemplate={() => (
                <div className="text-right">
                  <div>{period.label}</div>
                  <div className="text-xs font-normal text-muted-foreground">(GL)</div>
                </div>
              )}
              template={guidelineCellTemplate(period.key)}
              width="120"
              textAlign="Right"
              allowEditing={!isReadOnly}
            />
          ))}
        </ColumnsDirective>
        <Inject services={[Edit, Freeze, Selection]} />
      </TreeGridComponent>
    </Card>
  )
}
