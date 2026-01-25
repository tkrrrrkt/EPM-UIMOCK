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
import { cn } from "@/lib/utils"
import type {
  BffActualRow,
  BffActualPeriodColumn,
  BffActualCell,
  BffAffectedRow,
  ActualMonthStatus,
  SourceType,
} from "@epm/contracts/bff/actual-entry"

// ============================================
// Types
// ============================================

interface TreeGridRow {
  id: string
  parentId: string | null
  subjectId: string
  subjectCode: string
  subjectName: string
  subjectClass: string
  displayName: string
  indentLevel: number
  isEditable: boolean
  isExpanded: boolean
  sourceType: SourceType
  isBreakdownRow: boolean
  originalRowId: string
  annualTotal: string
  [key: string]: string | number | boolean | null
}

interface TreeGridActualGridProps {
  periods: BffActualPeriodColumn[]
  rows: BffActualRow[]
  isEditable: boolean
  showAdjustmentBreakdown: boolean
  onCellChange: (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null,
    sourceType: SourceType
  ) => Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }>
}

// ============================================
// Component
// ============================================

export function TreeGridActualGrid({
  periods,
  rows,
  isEditable,
  showAdjustmentBreakdown,
  onCellChange,
}: TreeGridActualGridProps) {
  const treeGridRef = React.useRef<TreeGridComponent>(null)
  const saveTimeoutRef = React.useRef<Record<string, NodeJS.Timeout>>({})
  const [localData, setLocalData] = React.useState<TreeGridRow[]>([])

  // Convert BFF rows to TreeGrid flat data with optional breakdown rows
  const convertToTreeGridData = React.useCallback(
    (bffRows: BffActualRow[]): TreeGridRow[] => {
      const treeGridRows: TreeGridRow[] = []

      bffRows.forEach((row) => {
        // Main TOTAL row
        const mainRow: TreeGridRow = {
          id: row.rowId,
          parentId: row.parentRowId,
          subjectId: row.subjectId,
          subjectCode: row.subjectCode,
          subjectName: row.subjectName,
          subjectClass: row.subjectClass,
          displayName: row.subjectClass === "AGGREGATE" ? `【${row.subjectName}】` : row.subjectName,
          indentLevel: row.indentLevel,
          isEditable: row.isEditable && isEditable,
          isExpanded: row.isExpanded,
          sourceType: "TOTAL",
          isBreakdownRow: false,
          originalRowId: row.rowId,
          annualTotal: row.annualTotal,
        }

        // Map cells to columns
        row.cells.forEach((cell) => {
          mainRow[`period_${cell.periodId}`] = cell.value
        })

        treeGridRows.push(mainRow)

        // Add breakdown rows if enabled and data exists
        if (showAdjustmentBreakdown && row.inputRow && row.adjustRow) {
          // INPUT row (ERP imported values)
          const inputRow: TreeGridRow = {
            id: `${row.rowId}_input`,
            parentId: row.rowId,
            subjectId: row.subjectId,
            subjectCode: row.subjectCode,
            subjectName: row.subjectName,
            subjectClass: row.subjectClass,
            displayName: "├ 取込",
            indentLevel: row.indentLevel + 1,
            isEditable: false, // INPUT rows are never editable
            isExpanded: true,
            sourceType: "INPUT",
            isBreakdownRow: true,
            originalRowId: row.rowId,
            annualTotal: row.inputRow.annualTotal,
          }

          row.inputRow.cells.forEach((cell) => {
            inputRow[`period_${cell.periodId}`] = cell.value
          })

          treeGridRows.push(inputRow)

          // ADJUST row (adjustment values)
          const adjustRow: TreeGridRow = {
            id: `${row.rowId}_adjust`,
            parentId: row.rowId,
            subjectId: row.subjectId,
            subjectCode: row.subjectCode,
            subjectName: row.subjectName,
            subjectClass: row.subjectClass,
            displayName: "└ 調整",
            indentLevel: row.indentLevel + 1,
            isEditable: row.isEditable && isEditable,
            isExpanded: true,
            sourceType: "ADJUST",
            isBreakdownRow: true,
            originalRowId: row.rowId,
            annualTotal: row.adjustRow.annualTotal,
          }

          row.adjustRow.cells.forEach((cell) => {
            adjustRow[`period_${cell.periodId}`] = cell.value
          })

          treeGridRows.push(adjustRow)
        }
      })

      return treeGridRows
    },
    [isEditable, showAdjustmentBreakdown]
  )

  React.useEffect(() => {
    setLocalData(convertToTreeGridData(rows))
  }, [rows, convertToTreeGridData])

  // Get month status background class
  const getMonthStatusBgClass = (monthStatus: ActualMonthStatus, periodType: string): string => {
    // Aggregate column backgrounds
    if (periodType === "QUARTER") return "treegrid-quarter-bg"
    if (periodType === "HALF") return "treegrid-half-bg"
    if (periodType === "ANNUAL") return "treegrid-annual-bg"

    // Month status backgrounds
    switch (monthStatus) {
      case "HARD_CLOSED":
        return "treegrid-hardclosed-bg"
      case "SOFT_CLOSED":
        return "treegrid-softclosed-bg"
      case "OPEN":
        return ""
      case "FUTURE":
        return "treegrid-future-bg"
      default:
        return ""
    }
  }

  // Get month status label
  const getMonthStatusLabel = (monthStatus: ActualMonthStatus): string => {
    switch (monthStatus) {
      case "HARD_CLOSED":
        return "確定"
      case "SOFT_CLOSED":
        return "仮締"
      case "OPEN":
        return "入力"
      case "FUTURE":
        return "未経過"
      default:
        return ""
    }
  }

  // Cell template for period columns
  const cellTemplate = (period: BffActualPeriodColumn) => (props: TreeGridRow) => {
    const value = props[`period_${period.periodId}`]
    const formattedValue = formatAmount(value as string | null)
    const isAggregate = props.subjectClass === "AGGREGATE"
    const isBreakdownRow = props.isBreakdownRow

    return (
      <div
        className={cn(
          "text-right font-mono text-sm",
          isAggregate && "font-medium",
          isBreakdownRow && "text-muted-foreground"
        )}
      >
        {formattedValue}
      </div>
    )
  }

  // Header template for period columns
  const headerTemplate = (period: BffActualPeriodColumn) => () => (
    <div className="flex flex-col items-end">
      <span>{period.periodLabel}</span>
      {period.periodType === "MONTH" && (
        <span className="text-[10px] text-muted-foreground">
          {getMonthStatusLabel(period.monthStatus)}
        </span>
      )}
    </div>
  )

  // Subject column template
  const subjectTemplate = (props: TreeGridRow) => {
    const isAggregate = props.subjectClass === "AGGREGATE"
    return (
      <div
        className={cn(
          "flex items-center gap-1",
          isAggregate && "text-muted-foreground font-medium",
          props.isBreakdownRow && "text-muted-foreground text-sm"
        )}
        style={{ paddingLeft: `${(props.indentLevel || 0) * 16}px` }}
      >
        {props.displayName}
      </div>
    )
  }

  // Format amount for display
  const formatAmount = (value: string | null): string => {
    if (value === null || value === "") return ""
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  // Handle cell edit
  const handleCellEdit = async (args: {
    rowData: TreeGridRow
    columnName: string
    value: string
    previousValue: string
  }) => {
    const { rowData, columnName, value, previousValue } = args

    // Prevent editing if same value
    if (value === previousValue) return

    // Extract period ID from column name
    const periodMatch = columnName.match(/^period_(.+)$/)
    if (!periodMatch) return

    const periodId = periodMatch[1]
    const period = periods.find((p) => p.periodId === periodId)

    // Prevent editing for non-editable conditions
    if (!period?.isEditable) return
    if (period.monthStatus === "HARD_CLOSED" || period.monthStatus === "FUTURE") return
    if (rowData.sourceType === "INPUT") return // INPUT rows are never editable
    if (rowData.sourceType === "TOTAL" && showAdjustmentBreakdown) return // TOTAL when showing breakdown

    const cellKey = `${rowData.id}:${periodId}`

    // Clear existing timeout
    if (saveTimeoutRef.current[cellKey]) {
      clearTimeout(saveTimeoutRef.current[cellKey])
    }

    // Debounce save
    saveTimeoutRef.current[cellKey] = setTimeout(async () => {
      const actualSourceType: SourceType = rowData.sourceType === "TOTAL" ? "ADJUST" : rowData.sourceType

      const result = await onCellChange(
        rowData.originalRowId,
        rowData.subjectId,
        periodId,
        null,
        value === "" ? null : value,
        actualSourceType
      )

      if (result.success && result.affectedRows) {
        // Update affected rows in local data
        setLocalData((prev) => {
          const newData = [...prev]
          result.affectedRows?.forEach((affected) => {
            const rowIndex = newData.findIndex((r) => r.id === affected.rowId)
            if (rowIndex !== -1) {
              affected.cells.forEach((cell) => {
                newData[rowIndex][`period_${cell.periodId}`] = cell.value
              })
              newData[rowIndex].annualTotal = affected.annualTotal
            }
          })
          return newData
        })
      }
    }, 200)
  }

  // Cell editing event handler
  const actionComplete = (args: { requestType: string; data?: TreeGridRow; cell?: HTMLElement }) => {
    if (args.requestType === "save" && args.data) {
      const treeGridInstance = treeGridRef.current
      if (!treeGridInstance) return

      // Get the edited column
      const editedColumn = (treeGridInstance as TreeGridComponent & { editModule?: { editCellIndex?: number } })
        .editModule?.editCellIndex
      if (editedColumn === undefined) return

      const columns = treeGridInstance.columns
      if (!columns || editedColumn >= columns.length) return

      const column = columns[editedColumn] as { field?: string }
      const columnName = column?.field
      if (!columnName) return

      // Get the previous value from the cell element
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

    const fieldMatch = args.column.field.match(/^period_(.+)$/)
    if (fieldMatch) {
      const periodId = fieldMatch[1]
      const period = periods.find((p) => p.periodId === periodId)
      if (period) {
        const bgClass = getMonthStatusBgClass(period.monthStatus, period.periodType)
        if (bgClass) {
          args.cell.classList.add(bgClass)
        }
      }
    }

    // Style for aggregate rows
    if (args.data.subjectClass === "AGGREGATE") {
      args.cell.classList.add("treegrid-aggregate-row")
    }

    // Style for breakdown rows
    if (args.data.isBreakdownRow) {
      args.cell.classList.add("treegrid-breakdown-row")
      if (args.data.sourceType === "INPUT") {
        args.cell.classList.add("treegrid-input-row")
      } else if (args.data.sourceType === "ADJUST") {
        args.cell.classList.add("treegrid-adjust-row")
      }
    }
  }

  // Row styling
  const rowDataBound = (args: { row?: HTMLElement; data?: TreeGridRow }) => {
    if (!args.row || !args.data) return

    if (args.data.subjectClass === "AGGREGATE") {
      args.row.classList.add("treegrid-aggregate-row")
    }

    if (args.data.isBreakdownRow) {
      args.row.classList.add("treegrid-breakdown-row")
    }
  }

  // Edit settings
  const editSettings = {
    allowEditing: isEditable,
    mode: "Cell" as const,
    showConfirmDialog: false,
  }

  return (
    <div className="treegrid-actual-container">
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
        height="500px"
        enableCollapseAll={false}
      >
        <ColumnsDirective>
          {/* Subject column */}
          <ColumnDirective
            field="displayName"
            headerText="科目"
            width="200"
            template={subjectTemplate}
            allowEditing={false}
            freeze="Left"
          />

          {/* Period columns */}
          {periods.map((period) => (
            <ColumnDirective
              key={period.periodId}
              field={`period_${period.periodId}`}
              headerText={period.periodLabel}
              headerTemplate={headerTemplate(period)}
              template={cellTemplate(period)}
              width="80"
              textAlign="Right"
              allowEditing={period.isEditable}
            />
          ))}
        </ColumnsDirective>
        <Inject services={[Edit, Freeze, Selection]} />
      </TreeGridComponent>
    </div>
  )
}
