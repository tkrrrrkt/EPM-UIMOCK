"use client"

import { useMemo, useCallback, useState } from "react"
import type { ColDef } from "ag-grid-community"
import { Card } from "@/shared/ui"
import { EditableAmountGrid, type GuidelineAmountRowData, type PendingChange, amountValueFormatter, amountValueParser } from "@/shared/ag-grid"
import type {
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
} from "@epm/contracts/bff/budget-guideline"

interface AmountGridProps {
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  guidelineAmounts: BffGuidelineAmountCell[]
  actualsYears: number[]
  actualsAmounts: BffActualCell[]
  isReadOnly: boolean
  onAmountChange: (subjectId: string, periodKey: string, amount: string) => void
}

/**
 * 予算ガイドライン 数値入力グリッド（AG-Grid版）
 *
 * 機能:
 * - Excelライクなコピー＆ペースト
 * - 範囲選択
 * - キーボードナビゲーション（Tab, Enter, 矢印キー）
 * - 実績列（過去5年）は読み取り専用
 * - ガイドライン列は編集可能（集計行除く）
 */
export function AmountGrid({
  subjects,
  guidelinePeriods,
  guidelineAmounts,
  actualsYears,
  actualsAmounts,
  isReadOnly,
  onAmountChange,
}: AmountGridProps) {
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    guidelineAmounts.forEach((cell) => {
      const key = `${cell.subjectId}-${cell.periodKey}`
      map.set(key, cell.amount)
    })
    return map
  })

  // ツリーパス取得コールバック
  const getDataPath = useCallback((row: GuidelineAmountRowData) => {
    return row.treePath || [row.subjectName]
  }, [])

  // APIレスポンスをAG-Grid用の行データに変換
  const rowData = useMemo<GuidelineAmountRowData[]>(() => {
    return subjects.map((subject) => {
      const row: GuidelineAmountRowData = {
        id: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        isAggregate: subject.isAggregate,
        indentLevel: subject.indentLevel,
        treePath: subject.treePath,
      }

      // 実績年度の金額を追加
      actualsYears.forEach((year) => {
        const fieldName = `actual_${year}`
        const amount = actualsAmounts.find(
          (a) => a.subjectId === subject.id && a.fiscalYear === year
        )
        row[fieldName] = parseFloat(amount?.amount || "0")
      })

      // ガイドライン期間の金額を追加
      guidelinePeriods.forEach((period) => {
        const fieldName = `gl_${period.key}`
        const key = `${subject.id}-${period.key}`
        const amount = localAmounts.get(key) || "0"
        row[fieldName] = parseFloat(amount)
      })

      return row
    })
  }, [subjects, actualsYears, actualsAmounts, guidelinePeriods, localAmounts])

  // 列定義（科目名列はautoGroupColumnDefで自動生成）
  const columnDefs = useMemo<ColDef<GuidelineAmountRowData>[]>(() => {
    const cols: ColDef<GuidelineAmountRowData>[] = []

    // 実績年度列を追加
    actualsYears.forEach((year) => {
      cols.push({
        field: `actual_${year}`,
        headerName: `FY${year}\n実績`,
        width: 100,
        editable: false,
        valueFormatter: amountValueFormatter,
        cellStyle: {
          textAlign: "right",
          backgroundColor: "hsl(var(--muted) / 0.3)",
          color: "hsl(var(--muted-foreground))",
        },
        cellClass: "tabular-nums",
      })
    })

    // ガイドライン期間列を追加
    guidelinePeriods.forEach((period) => {
      cols.push({
        field: `gl_${period.key}`,
        headerName: `${period.label}\nGL`,
        width: 120,
        editable: (params) => {
          if (isReadOnly) return false
          if (params.data?.isAggregate) return false
          return true
        },
        valueFormatter: amountValueFormatter,
        valueParser: amountValueParser,
        cellStyle: { textAlign: "right" },
        cellClass: (params) => {
          const classes: string[] = ["tabular-nums"]
          if (params.data?.isAggregate) classes.push("font-semibold")
          return classes.join(" ")
        },
      })
    })

    return cols
  }, [actualsYears, guidelinePeriods, isReadOnly])

  // セル値変更時の処理
  const handleCellValueChanged = useCallback(
    (change: PendingChange) => {
      // フィールド名から periodKey を抽出（gl_xxx → xxx）
      const periodKey = change.field.replace(/^gl_/, "")
      const key = `${change.rowId}-${periodKey}`

      // ローカル状態を更新
      setLocalAmounts((prev) => {
        const updated = new Map(prev)
        updated.set(key, change.newValue)
        return updated
      })

      // 親に通知
      onAmountChange(change.rowId, periodKey, change.newValue)
    },
    [onAmountChange]
  )

  return (
    <Card className="overflow-hidden">
      <EditableAmountGrid<GuidelineAmountRowData>
        rowData={rowData}
        columnDefs={columnDefs}
        isReadOnly={isReadOnly}
        height={Math.min(500, 80 + subjects.length * 36)}
        onCellValueChanged={handleCellValueChanged}
        getRowId={(data) => data.id}
        treeData={true}
        getDataPath={getDataPath}
        groupDefaultExpanded={1}
      />
    </Card>
  )
}
