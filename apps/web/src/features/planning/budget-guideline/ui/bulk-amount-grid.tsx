"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
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
import { EditableAmountGrid, type GuidelineAmountRowData, type PendingChange, amountValueFormatter, amountValueParser } from "@/shared/ag-grid"
import type {
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
  BffDimensionValueSummary,
} from "@epm/contracts/bff/budget-guideline"

interface BulkAmountData {
  dimensionValueId: string
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  guidelineAmounts: BffGuidelineAmountCell[]
  actualsYears: number[]
  actualsAmounts: BffActualCell[]
  isReadOnly: boolean
}

interface BulkAmountGridProps {
  dimensionValues: BffDimensionValueSummary[]
  bulkData: BulkAmountData[]
  onAmountChange: (dimensionValueId: string, subjectId: string, periodKey: string, amount: string) => void
}

/**
 * 予算ガイドライン 一括入力グリッド（AG-Grid版）
 *
 * 機能:
 * - 全社合計: 読み取り専用、フロント側でリアルタイム自動集計
 * - 各事業部: アコーディオン内にAG-Gridインスタンス配置
 * - Excelライクなコピー＆ペースト
 * - 範囲選択
 */
export function BulkAmountGrid({ dimensionValues, bulkData, onAmountChange }: BulkAmountGridProps) {
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(new Map())

  // 初期データをローカルステートに設定
  useEffect(() => {
    const amountMap = new Map<string, string>()
    bulkData.forEach((data) => {
      data.guidelineAmounts.forEach((cell) => {
        const key = `${data.dimensionValueId}-${cell.subjectId}-${cell.periodKey}`
        amountMap.set(key, cell.amount)
      })
    })
    setLocalAmounts(amountMap)
  }, [bulkData])

  // 全社分を最初に取得（サンプルとして科目・期間情報を得る）
  const totalData = bulkData.find((d) => d.dimensionValueId === "dv-total")
  const sampleData = totalData || bulkData[0]

  if (!sampleData) return null

  const subjects = sampleData.subjects
  const guidelinePeriods = sampleData.guidelinePeriods
  const actualsYears = sampleData.actualsYears

  // ガイドライン列のフィールド名リスト
  const glFields = useMemo(() => {
    return guidelinePeriods.map((p) => `gl_${p.key}`)
  }, [guidelinePeriods])

  // ディメンション値を並び替え（全社が最初、それ以外はソート順）
  const sortedDimensionValues = useMemo(() => {
    const totalDv = dimensionValues.find((dv) => dv.isTotal)
    const otherDvs = dimensionValues.filter((dv) => !dv.isTotal)
    return totalDv ? [totalDv, ...otherDvs] : otherDvs
  }, [dimensionValues])

  // フロントエンド側での全社集計計算
  const calculateTotalAmount = useCallback(
    (subjectId: string, periodKey: string): number => {
      let total = 0
      bulkData
        .filter((d) => d.dimensionValueId !== "dv-total")
        .forEach((data) => {
          const key = `${data.dimensionValueId}-${subjectId}-${periodKey}`
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
  const getDataPath = useCallback((row: GuidelineAmountRowData) => {
    return row.treePath || [row.subjectName]
  }, [])

  // 列定義生成（科目名列はautoGroupColumnDefで自動生成）
  const createColumnDefs = useCallback(
    (isTotal: boolean, isReadOnly: boolean): ColDef<GuidelineAmountRowData>[] => {
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
        const canEdit = !isTotal && !isReadOnly

        cols.push({
          field: `gl_${period.key}`,
          headerName: `${period.label}\nGL`,
          width: 120,
          editable: (params) => {
            if (!canEdit) return false
            if (params.data?.isAggregate) return false
            return true
          },
          valueFormatter: amountValueFormatter,
          valueParser: amountValueParser,
          cellStyle: (params) => {
            const style: Record<string, string> = { textAlign: "right" }
            if (isTotal) {
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

      return cols
    },
    [actualsYears, guidelinePeriods]
  )

  // 全社合計用の行データ生成
  const totalRowData = useMemo<GuidelineAmountRowData[]>(() => {
    return subjects.map((subject) => {
      const row: GuidelineAmountRowData = {
        id: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        isAggregate: subject.isAggregate,
        indentLevel: subject.indentLevel,
        treePath: subject.treePath,
      }

      // 実績年度
      actualsYears.forEach((year) => {
        const fieldName = `actual_${year}`
        const key = `dv-total-${subject.id}-${year}`
        // 実績は各データから取得
        const amount = totalData?.actualsAmounts.find(
          (a) => a.subjectId === subject.id && a.fiscalYear === year
        )
        row[fieldName] = parseFloat(amount?.amount || "0")
      })

      // ガイドライン期間（フロント側で集計）
      guidelinePeriods.forEach((period) => {
        const fieldName = `gl_${period.key}`
        row[fieldName] = calculateTotalAmount(subject.id, period.key)
      })

      return row
    })
  }, [subjects, actualsYears, guidelinePeriods, totalData, calculateTotalAmount])

  // 事業部用の行データ生成
  const createBuRowData = useCallback(
    (data: BulkAmountData): GuidelineAmountRowData[] => {
      return subjects.map((subject) => {
        const row: GuidelineAmountRowData = {
          id: subject.id,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          isAggregate: subject.isAggregate,
          indentLevel: subject.indentLevel,
          treePath: subject.treePath,
        }

        // 実績年度
        actualsYears.forEach((year) => {
          const fieldName = `actual_${year}`
          const amount = data.actualsAmounts.find(
            (a) => a.subjectId === subject.id && a.fiscalYear === year
          )
          row[fieldName] = parseFloat(amount?.amount || "0")
        })

        // ガイドライン期間
        guidelinePeriods.forEach((period) => {
          const fieldName = `gl_${period.key}`
          const key = `${data.dimensionValueId}-${subject.id}-${period.key}`
          row[fieldName] = parseFloat(localAmounts.get(key) || "0")
        })

        return row
      })
    },
    [subjects, actualsYears, guidelinePeriods, localAmounts]
  )

  // セル値変更時の処理
  const handleCellValueChanged = useCallback(
    (dimensionValueId: string) => (change: PendingChange) => {
      const periodKey = change.field.replace(/^gl_/, "")
      const key = `${dimensionValueId}-${change.rowId}-${periodKey}`

      // ローカル状態を更新
      setLocalAmounts((prev) => {
        const updated = new Map(prev)
        updated.set(key, change.newValue)
        return updated
      })

      // 親に通知
      onAmountChange(dimensionValueId, change.rowId, periodKey, change.newValue)
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
            <EditableAmountGrid<GuidelineAmountRowData>
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
      <Accordion type="multiple" defaultValue={sortedDimensionValues.filter((dv) => !dv.isTotal).map((dv) => dv.id)}>
        {sortedDimensionValues
          .filter((dv) => !dv.isTotal)
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
                    {data.isReadOnly && (
                      <span className="text-xs text-muted-foreground">(読み取り専用)</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border-t">
                    <EditableAmountGrid<GuidelineAmountRowData>
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
