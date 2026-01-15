"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui"
import type {
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
  BffDimensionValueSummary,
} from "@epm/contracts/bff/budget-guideline"
import { cn } from "@/lib/utils"

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

export function BulkAmountGrid({ dimensionValues, bulkData, onAmountChange }: BulkAmountGridProps) {
  const [editingCell, setEditingCell] = useState<{
    dimensionValueId: string
    subjectId: string
    periodKey: string
  } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // 全社分を最初に取得（サンプルとして科目・期間情報を得る）
  const totalData = bulkData.find((d) => d.dimensionValueId === "dv-total")
  const sampleData = totalData || bulkData[0]
  if (!sampleData) return null

  const subjects = sampleData.subjects
  const guidelinePeriods = sampleData.guidelinePeriods
  const actualsYears = sampleData.actualsYears

  const formatAmount = (amount: string): string => {
    if (!amount || amount === "0") return "-"
    const num = Number(amount)
    return num.toLocaleString("ja-JP")
  }

  const getActualAmount = (data: BulkAmountData, subjectId: string, fiscalYear: number): string => {
    const cell = data.actualsAmounts.find((a) => a.subjectId === subjectId && a.fiscalYear === fiscalYear)
    return cell ? formatAmount(cell.amount) : "-"
  }

  const getGuidelineAmount = (dimensionValueId: string, subjectId: string, periodKey: string): string => {
    const key = `${dimensionValueId}-${subjectId}-${periodKey}`
    return localAmounts.get(key) || ""
  }

  // フロントエンド側での全社集計計算
  const calculateTotalAmount = useCallback(
    (subjectId: string, periodKey: string): string => {
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
      return String(total)
    },
    [bulkData, localAmounts],
  )

  const handleCellClick = (dimensionValueId: string, subjectId: string, periodKey: string, isAggregate: boolean) => {
    const data = bulkData.find((d) => d.dimensionValueId === dimensionValueId)
    if (!data || data.isReadOnly || isAggregate) return
    // 全社合計は編集不可
    if (dimensionValueId === "dv-total") return

    const currentAmount = getGuidelineAmount(dimensionValueId, subjectId, periodKey)
    setEditingCell({ dimensionValueId, subjectId, periodKey })
    setEditValue(currentAmount)
  }

  const handleSave = () => {
    if (editingCell) {
      // ローカルステートを更新
      const key = `${editingCell.dimensionValueId}-${editingCell.subjectId}-${editingCell.periodKey}`
      setLocalAmounts((prev) => {
        const next = new Map(prev)
        next.set(key, editValue)
        return next
      })

      // 親に通知
      onAmountChange(editingCell.dimensionValueId, editingCell.subjectId, editingCell.periodKey, editValue)
      setEditingCell(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

  // ディメンション値を並び替え（全社が最初、それ以外はソート順）
  const sortedDimensionValues = useMemo(() => {
    const totalDv = dimensionValues.find((dv) => dv.isTotal)
    const otherDvs = dimensionValues.filter((dv) => !dv.isTotal)
    return totalDv ? [totalDv, ...otherDvs] : otherDvs
  }, [dimensionValues])

  // 共通テーブルヘッダー
  const renderTableHeader = () => (
    <tr className="border-b bg-muted/50">
      <th className="sticky left-0 z-20 min-w-[180px] border-r bg-muted/50 p-3 text-left font-medium">科目</th>
      {actualsYears.map((year) => (
        <th key={year} className="min-w-[100px] border-r bg-muted/50 p-3 text-right font-medium">
          FY{year}
          <div className="text-xs font-normal text-muted-foreground">(実績)</div>
        </th>
      ))}
      {guidelinePeriods.map((period) => (
        <th key={period.key} className="min-w-[120px] border-r bg-background p-3 text-right font-medium">
          {period.label}
          <div className="text-xs font-normal text-muted-foreground">(GL)</div>
        </th>
      ))}
    </tr>
  )

  // テーブル行レンダリング
  const renderTableRow = (data: BulkAmountData, subject: BffSubjectRow, isTotal: boolean) => {
    const canEdit = !data.isReadOnly && !subject.isAggregate && !isTotal

    return (
      <tr
        key={`${data.dimensionValueId}-${subject.id}`}
        className={cn("border-b hover:bg-muted/30", subject.isAggregate && "bg-muted/20")}
      >
        <td
          className={cn(
            "sticky left-0 z-10 border-r bg-background p-3 font-medium",
            subject.isAggregate && "bg-muted/20 font-semibold",
          )}
        >
          {subject.subjectName}
        </td>

        {/* 実績列 */}
        {actualsYears.map((year) => (
          <td key={year} className="border-r bg-muted/10 p-3 text-right tabular-nums text-muted-foreground">
            {getActualAmount(data, subject.id, year)}
          </td>
        ))}

        {/* ガイドライン列 */}
        {guidelinePeriods.map((period) => {
          const isEditing =
            editingCell?.dimensionValueId === data.dimensionValueId &&
            editingCell?.subjectId === subject.id &&
            editingCell?.periodKey === period.key

          // 全社の場合はフロント側で集計
          const amount = isTotal
            ? calculateTotalAmount(subject.id, period.key)
            : getGuidelineAmount(data.dimensionValueId, subject.id, period.key)

          return (
            <td
              key={period.key}
              className={cn(
                "border-r p-3 text-right tabular-nums",
                canEdit && "cursor-pointer hover:bg-primary/5",
                subject.isAggregate && "bg-muted/20 font-semibold",
                isTotal && "bg-primary/5 font-semibold",
              )}
              onClick={() => handleCellClick(data.dimensionValueId, subject.id, period.key, subject.isAggregate)}
            >
              {isEditing ? (
                <Input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="h-8 w-full text-right"
                />
              ) : (
                formatAmount(amount)
              )}
            </td>
          )
        })}
      </tr>
    )
  }

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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>{renderTableHeader()}</thead>
                <tbody>
                  {subjects.map((subject) => renderTableRow(totalData, subject, true))}
                </tbody>
              </table>
            </div>
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
                  <div className="overflow-x-auto border-t">
                    <table className="w-full border-collapse text-sm">
                      <thead>{renderTableHeader()}</thead>
                      <tbody>
                        {subjects.map((subject) => renderTableRow(data, subject, false))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>
    </div>
  )
}
