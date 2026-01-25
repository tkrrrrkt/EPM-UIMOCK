"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
import type {
  BffSubjectRow,
  BffAmountColumn,
  BffMtpAmountCell,
  BffDimensionValueSummary,
} from "@epm/contracts/bff/mtp"
import { formatAmount, parseAmount } from "../utils/format"
import { cn } from "@/lib/utils"

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

export function MtpBulkAmountGrid({ dimensionValues, bulkData, onAmountChange }: MtpBulkAmountGridProps) {
  const [editingCell, setEditingCell] = useState<{
    dimensionValueId: string
    subjectId: string
    fiscalYear: number
  } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // 全社分を最初に取得（サンプルとして科目・列情報を得る）
  const totalData = bulkData.find((d) => d.dimensionValueId === "dv-all")
  const sampleData = totalData || bulkData[0]
  if (!sampleData) return null

  const subjects = sampleData.subjects
  const columns = sampleData.columns

  const getLocalAmount = (dimensionValueId: string, subjectId: string, fiscalYear: number): string => {
    const key = `${dimensionValueId}-${subjectId}-${fiscalYear}`
    return localAmounts.get(key) || "0"
  }

  // フロントエンド側での全社集計計算（計画列のみ）
  const calculateTotalAmount = useCallback(
    (subjectId: string, fiscalYear: number): string => {
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
      return String(total)
    },
    [bulkData, localAmounts],
  )

  const handleCellClick = (
    dimensionValueId: string,
    subjectId: string,
    fiscalYear: number,
    isActual: boolean,
    isAggregate: boolean,
  ) => {
    const data = bulkData.find((d) => d.dimensionValueId === dimensionValueId)
    if (!data || data.isReadOnly || isAggregate || isActual) return
    // 全社合計は編集不可
    if (dimensionValueId === "dv-all") return

    const currentAmount = getLocalAmount(dimensionValueId, subjectId, fiscalYear)
    setEditingCell({ dimensionValueId, subjectId, fiscalYear })
    setEditValue(formatAmount(currentAmount))
  }

  const handleSave = () => {
    if (editingCell) {
      const parsedAmount = parseAmount(editValue)

      // ローカルステートを更新
      const key = `${editingCell.dimensionValueId}-${editingCell.subjectId}-${editingCell.fiscalYear}`
      setLocalAmounts((prev) => {
        const next = new Map(prev)
        next.set(key, parsedAmount)
        return next
      })

      // 親に通知
      onAmountChange(editingCell.dimensionValueId, editingCell.subjectId, editingCell.fiscalYear, parsedAmount)
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

  // ディメンション値を並び替え（全社が最初）
  const sortedDimensionValues = useMemo(() => {
    const totalDv = dimensionValues.find((dv) => dv.valueCode === "ALL")
    const otherDvs = dimensionValues.filter((dv) => dv.valueCode !== "ALL")
    return totalDv ? [totalDv, ...otherDvs] : otherDvs
  }, [dimensionValues])

  // 共通テーブルヘッダー
  const renderTableHeader = () => (
    <tr className="border-b bg-muted/50">
      <th className="sticky left-0 z-20 min-w-[180px] border-r bg-muted/50 p-3 text-left font-medium">科目</th>
      {columns.map((col) => (
        <th
          key={`${col.fiscalYear}-${col.isActual}`}
          className={cn("min-w-[100px] border-r p-3 text-right font-medium", col.isActual && "bg-muted/50")}
        >
          FY{col.fiscalYear}
          <div className="text-xs font-normal text-muted-foreground">{col.isActual ? "(実績)" : "(計画)"}</div>
        </th>
      ))}
      <th className="min-w-[100px] border-r bg-muted/30 p-3 text-right font-medium">計画合計</th>
    </tr>
  )

  // テーブル行レンダリング
  const renderTableRow = (data: BulkMtpAmountData, subject: BffSubjectRow, isTotal: boolean) => {
    // 計画列の合計を計算
    const planTotal = columns
      .filter((c) => !c.isActual)
      .reduce((sum, col) => {
        const amount = isTotal
          ? calculateTotalAmount(subject.id, col.fiscalYear)
          : getLocalAmount(data.dimensionValueId, subject.id, col.fiscalYear)
        return sum + (Number(amount) || 0)
      }, 0)

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

        {columns.map((col) => {
          const isEditing =
            editingCell?.dimensionValueId === data.dimensionValueId &&
            editingCell?.subjectId === subject.id &&
            editingCell?.fiscalYear === col.fiscalYear

          // 全社の場合はフロント側で集計（計画列のみ、実績列はデータから取得）
          const amount =
            isTotal && !col.isActual
              ? calculateTotalAmount(subject.id, col.fiscalYear)
              : getLocalAmount(data.dimensionValueId, subject.id, col.fiscalYear)

          const canEdit = !data.isReadOnly && !subject.isAggregate && !col.isActual && !isTotal

          return (
            <td
              key={`${col.fiscalYear}-${col.isActual}`}
              className={cn(
                "border-r p-3 text-right tabular-nums",
                col.isActual && "bg-muted/10 text-muted-foreground",
                canEdit && "cursor-pointer hover:bg-primary/5",
                subject.isAggregate && "bg-muted/20 font-semibold",
                isTotal && !col.isActual && "bg-primary/5 font-semibold",
              )}
              onClick={() => handleCellClick(data.dimensionValueId, subject.id, col.fiscalYear, col.isActual, subject.isAggregate)}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-right outline-none focus:bg-accent"
                  autoFocus
                />
              ) : (
                formatAmount(amount)
              )}
            </td>
          )
        })}

        <td
          className={cn(
            "border-r bg-muted/30 p-3 text-right tabular-nums font-semibold",
            subject.isAggregate && "font-bold",
          )}
        >
          {formatAmount(String(planTotal))}
        </td>
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
                <tbody>{subjects.map((subject) => renderTableRow(totalData, subject, true))}</tbody>
              </table>
            </div>
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

            return (
              <AccordionItem key={dv.id} value={dv.id}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{dv.valueName}</span>
                    {data.isReadOnly && <span className="text-xs text-muted-foreground">(読み取り専用)</span>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto border-t">
                    <table className="w-full border-collapse text-sm">
                      <thead>{renderTableHeader()}</thead>
                      <tbody>{subjects.map((subject) => renderTableRow(data, subject, false))}</tbody>
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
