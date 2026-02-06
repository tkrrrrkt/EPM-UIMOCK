"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { ColDef, ValueGetterParams } from "ag-grid-community"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui"
import { EditableAmountGrid, type MtpAmountRowData, type PendingChange, amountValueFormatter, amountValueParser } from "@/shared/ag-grid"
import type {
  BffSubjectRow,
  BffAmountColumn,
  BffMtpAmountCell,
  BffDimensionValueSummary,
} from "@epm/contracts/bff/mtp"

interface BulkMtpAmountData {
  dimensionValueId: string
  subjects: BffSubjectRow[]
  columns: BffAmountColumn[]
  amounts: BffMtpAmountCell[]
  isReadOnly: boolean
}

interface MtpBulkAmountGridProps {
  dimensionValues: BffDimensionValueSummary[]
  bulkData: BulkMtpAmountData[]
  onAmountChange: (dimensionValueId: string, subjectId: string, fiscalYear: number, amount: string) => void
}

/**
 * MTP 一括入力グリッド（AG-Grid版）
 *
 * 機能:
 * - 全社合計: 読み取り専用、フロント側でリアルタイム自動集計
 * - 各事業部: アコーディオン内にAG-Gridインスタンス配置
 * - Excelライクなコピー＆ペースト
 * - 範囲選択
 */
export function MtpBulkAmountGrid({ dimensionValues, bulkData, onAmountChange }: MtpBulkAmountGridProps) {
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(new Map())

  // 初期データをローカルステートに設定
  useEffect(() => {
    const amountMap = new Map<string, string>()
    bulkData.forEach((data) => {
      data.amounts.forEach((cell) => {
        const key = `${data.dimensionValueId}-${cell.subjectId}-${cell.fiscalYear}`
        amountMap.set(key, cell.amount)
      })
    })
    setLocalAmounts(amountMap)
  }, [bulkData])

  // 全社分を最初に取得（サンプルとして科目・列情報を得る）
  const totalData = bulkData.find((d) => d.dimensionValueId === "dv-all")
  const sampleData = totalData || bulkData[0]

  if (!sampleData) return null

  const subjects = sampleData.subjects
  const columns = sampleData.columns

  // 計画列のフィールド名リスト
  const planFields = useMemo(() => {
    return columns.filter((c) => !c.isActual).map((c) => `plan_${c.fiscalYear}`)
  }, [columns])

  // ディメンション値を並び替え（全社が最初）
  const sortedDimensionValues = useMemo(() => {
    const totalDv = dimensionValues.find((dv) => dv.valueCode === "ALL")
    const otherDvs = dimensionValues.filter((dv) => dv.valueCode !== "ALL")
    return totalDv ? [totalDv, ...otherDvs] : otherDvs
  }, [dimensionValues])

  // フロントエンド側での全社集計計算
  const calculateTotalAmount = useCallback(
    (subjectId: string, fiscalYear: number): number => {
      let total = 0
      bulkData
        .filter((d) => d.dimensionValueId !== "dv-all")
        .forEach((data) => {
          const key = `${data.dimensionValueId}-${subjectId}-${fiscalYear}`
          const amount = localAmounts.get(key)
          if (amount) {
            total += Number(amount) || 0
          }
        })
      return total
    },
    [bulkData, localAmounts]
  )

  // ツリーパス取得コールバック
  const getDataPath = useCallback((row: MtpAmountRowData) => {
    return row.treePath || [row.subjectName]
  }, [])

  // 列定義生成（科目名列はautoGroupColumnDefで自動生成）
  const createColumnDefs = useCallback(
    (isTotal: boolean, isReadOnly: boolean): ColDef<MtpAmountRowData>[] => {
      const cols: ColDef<MtpAmountRowData>[] = []

      // 年度列を追加
      columns.forEach((col) => {
        const fieldName = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`
        const canEdit = !isTotal && !col.isActual && !isReadOnly

        cols.push({
          field: fieldName,
          headerName: `FY${col.fiscalYear}\n${col.isActual ? "実績" : "計画"}`,
          width: 100,
          editable: (params) => {
            if (!canEdit) return false
            if (params.data?.isAggregate) return false
            return true
          },
          valueFormatter: amountValueFormatter,
          valueParser: amountValueParser,
          cellStyle: (params) => {
            const style: Record<string, string> = { textAlign: "right" }
            if (col.isActual) {
              style.backgroundColor = "hsl(var(--muted) / 0.3)"
              style.color = "hsl(var(--muted-foreground))"
            }
            if (isTotal && !col.isActual) {
              style.backgroundColor = "hsl(var(--primary) / 0.05)"
              style.fontWeight = "600"
            }
            return style
          },
          cellClass: (params) => {
            const classes: string[] = ["tabular-nums"]
            if (params.data?.isAggregate) classes.push("font-semibold")
            return classes.join(" ")
          },
        })
      })

      // 計画合計列
      cols.push({
        headerName: "計画合計",
        width: 100,
        editable: false,
        valueGetter: (params: ValueGetterParams<MtpAmountRowData>) => {
          if (!params.data) return 0
          return planFields.reduce((sum, field) => {
            const value = params.data?.[field]
            if (value === null || value === undefined) return sum
            const num = typeof value === "string" ? parseFloat(value) : (value as number)
            if (isNaN(num)) return sum
            return sum + num
          }, 0)
        },
        valueFormatter: amountValueFormatter,
        cellClass: "font-semibold tabular-nums",
        cellStyle: {
          textAlign: "right",
          backgroundColor: "hsl(var(--muted) / 0.3)",
        },
      })

      return cols
    },
    [columns, planFields]
  )

  // 全社合計用の行データ生成
  const totalRowData = useMemo<MtpAmountRowData[]>(() => {
    return subjects.map((subject) => {
      const row: MtpAmountRowData = {
        id: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        isAggregate: subject.isAggregate,
        indentLevel: subject.indentLevel,
        treePath: subject.treePath,
      }

      columns.forEach((col) => {
        const fieldName = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`

        if (col.isActual) {
          // 実績列はデータから取得
          const key = `dv-all-${subject.id}-${col.fiscalYear}`
          row[fieldName] = parseFloat(localAmounts.get(key) || "0")
        } else {
          // 計画列はフロント側で集計
          row[fieldName] = calculateTotalAmount(subject.id, col.fiscalYear)
        }
      })

      return row
    })
  }, [subjects, columns, localAmounts, calculateTotalAmount])

  // 事業部用の行データ生成
  const createBuRowData = useCallback(
    (data: BulkMtpAmountData): MtpAmountRowData[] => {
      return subjects.map((subject) => {
        const row: MtpAmountRowData = {
          id: subject.id,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          isAggregate: subject.isAggregate,
          indentLevel: subject.indentLevel,
          treePath: subject.treePath,
        }

        columns.forEach((col) => {
          const fieldName = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`
          const key = `${data.dimensionValueId}-${subject.id}-${col.fiscalYear}`
          row[fieldName] = parseFloat(localAmounts.get(key) || "0")
        })

        return row
      })
    },
    [subjects, columns, localAmounts]
  )

  // セル値変更時の処理
  const handleCellValueChanged = useCallback(
    (dimensionValueId: string) => (change: PendingChange) => {
      const fiscalYear = parseInt(change.field.replace(/^plan_/, ""), 10)
      const key = `${dimensionValueId}-${change.rowId}-${fiscalYear}`

      // ローカル状態を更新
      setLocalAmounts((prev) => {
        const updated = new Map(prev)
        updated.set(key, change.newValue)
        return updated
      })

      // 親に通知
      onAmountChange(dimensionValueId, change.rowId, fiscalYear, change.newValue)
    },
    [onAmountChange]
  )

  // 列定義（全社用・読み取り専用）
  const totalColumnDefs = useMemo(() => createColumnDefs(true, true), [createColumnDefs])

  return (
    <div className="space-y-4">
      {/* 全社合計（常に表示・固定） */}
      {totalData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              全社合計
              <span className="text-xs font-normal text-muted-foreground">(自動集計)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EditableAmountGrid<MtpAmountRowData>
              rowData={totalRowData}
              columnDefs={totalColumnDefs}
              isReadOnly={true}
              height={Math.min(300, 80 + subjects.length * 36)}
              getRowId={(data) => data.id}
              treeData={true}
              getDataPath={getDataPath}
              groupDefaultExpanded={1}
            />
          </CardContent>
        </Card>
      )}

      {/* 各事業部（アコーディオン） */}
      <Accordion
        type="multiple"
        defaultValue={sortedDimensionValues.filter((dv) => dv.valueCode !== "ALL").map((dv) => dv.id)}
      >
        {sortedDimensionValues
          .filter((dv) => dv.valueCode !== "ALL")
          .map((dv) => {
            const data = bulkData.find((d) => d.dimensionValueId === dv.id)
            if (!data) return null

            const buColumnDefs = createColumnDefs(false, data.isReadOnly)
            const buRowData = createBuRowData(data)

            return (
              <AccordionItem key={dv.id} value={dv.id}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{dv.valueName}</span>
                    {data.isReadOnly && <span className="text-xs text-muted-foreground">(読み取り専用)</span>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border-t">
                    <EditableAmountGrid<MtpAmountRowData>
                      rowData={buRowData}
                      columnDefs={buColumnDefs}
                      isReadOnly={data.isReadOnly}
                      height={Math.min(300, 80 + subjects.length * 36)}
                      onCellValueChanged={handleCellValueChanged(dv.id)}
                      getRowId={(data) => data.id}
                      treeData={true}
                      getDataPath={getDataPath}
                      groupDefaultExpanded={1}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>
    </div>
  )
}
