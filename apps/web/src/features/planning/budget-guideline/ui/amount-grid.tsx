"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, Input } from "@/shared/ui"
import type {
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
} from "@epm/contracts/bff/budget-guideline"
import { cn } from "@/lib/utils"

interface AmountGridProps {
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  guidelineAmounts: BffGuidelineAmountCell[]
  actualsYears: number[]
  actualsAmounts: BffActualCell[]
  isReadOnly: boolean
  onAmountChange: (subjectId: string, periodKey: string, amount: string) => void
}

export function AmountGrid({
  subjects,
  guidelinePeriods,
  guidelineAmounts,
  actualsYears,
  actualsAmounts,
  isReadOnly,
  onAmountChange,
}: AmountGridProps) {
  const [editingCell, setEditingCell] = useState<{ subjectId: string; periodKey: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const getActualAmount = (subjectId: string, fiscalYear: number): string => {
    const cell = actualsAmounts.find((a) => a.subjectId === subjectId && a.fiscalYear === fiscalYear)
    return cell ? formatAmount(cell.amount) : "-"
  }

  const getGuidelineAmount = (subjectId: string, periodKey: string): string => {
    const cell = guidelineAmounts.find((a) => a.subjectId === subjectId && a.periodKey === periodKey)
    return cell ? cell.amount : ""
  }

  const formatAmount = (amount: string): string => {
    if (!amount || amount === "0") return "-"
    const num = Number(amount)
    return num.toLocaleString("ja-JP")
  }

  const handleCellClick = (subjectId: string, periodKey: string, isAggregate: boolean) => {
    if (isReadOnly || isAggregate) return

    const currentAmount = getGuidelineAmount(subjectId, periodKey)
    setEditingCell({ subjectId, periodKey })
    setEditValue(currentAmount)
  }

  const handleSave = () => {
    if (editingCell) {
      onAmountChange(editingCell.subjectId, editingCell.periodKey, editValue)
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

  return (
    <Card className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-20 min-w-[180px] border-r bg-muted/50 p-3 text-left font-medium">科目</th>
            {actualsYears.map((year) => (
              <th key={year} className="min-w-[120px] border-r bg-muted/50 p-3 text-right font-medium">
                FY{year}
                <div className="text-xs font-normal text-muted-foreground">(実績)</div>
              </th>
            ))}
            {guidelinePeriods.map((period) => (
              <th key={period.key} className="min-w-[120px] border-r bg-background p-3 text-right font-medium">
                {period.label}
                <div className="text-xs font-normal text-muted-foreground">(ガイドライン)</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id} className={cn("border-b hover:bg-muted/30", subject.isAggregate && "bg-muted/20")}>
              <td
                className={cn(
                  "sticky left-0 z-10 border-r bg-background p-3 font-medium",
                  subject.isAggregate && "bg-muted/20 font-semibold",
                )}
              >
                {subject.subjectName}
              </td>

              {/* Actual columns */}
              {actualsYears.map((year) => (
                <td key={year} className="border-r bg-muted/10 p-3 text-right tabular-nums text-muted-foreground">
                  {getActualAmount(subject.id, year)}
                </td>
              ))}

              {/* Guideline columns */}
              {guidelinePeriods.map((period) => {
                const isEditing = editingCell?.subjectId === subject.id && editingCell?.periodKey === period.key
                const amount = getGuidelineAmount(subject.id, period.key)
                const canEdit = !isReadOnly && !subject.isAggregate

                return (
                  <td
                    key={period.key}
                    className={cn(
                      "border-r p-3 text-right tabular-nums",
                      canEdit && "cursor-pointer hover:bg-primary/5",
                      subject.isAggregate && "bg-muted/20 font-semibold",
                    )}
                    onClick={() => handleCellClick(subject.id, period.key, subject.isAggregate)}
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
          ))}
        </tbody>
      </table>
    </Card>
  )
}
