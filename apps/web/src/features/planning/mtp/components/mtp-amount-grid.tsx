"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import { formatAmount, parseAmount } from "../utils/format"
import { cn } from "@/lib/utils"
import type { BffMtpAmountsResponse, BffMtpAmountCell } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface MtpAmountGridProps {
  eventId: string
  dimensionValueId: string
  data: BffMtpAmountsResponse
  loading: boolean
  onReload: () => void
}

interface EditingCell {
  subjectId: string
  fiscalYear: number
  value: string
}

export function MtpAmountGrid({ eventId, dimensionValueId, data, loading, onReload }: MtpAmountGridProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [pendingSaves, setPendingSaves] = useState<Map<string, BffMtpAmountCell>>(new Map())
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  useEffect(() => {
    if (pendingSaves.size === 0) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAmounts()
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [pendingSaves])

  async function saveAmounts() {
    if (pendingSaves.size === 0) return

    const amounts = Array.from(pendingSaves.values())

    try {
      await bffClient.saveAmounts(eventId, {
        dimensionValueId: dimensionValueId === "dv-all" ? "" : dimensionValueId,
        amounts,
      })
      setPendingSaves(new Map())
      onReload()
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "数値の保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  function getAmount(subjectId: string, fiscalYear: number): string {
    // Check pending saves first
    const key = `${subjectId}-${fiscalYear}`
    if (pendingSaves.has(key)) {
      return pendingSaves.get(key)!.amount
    }

    const cell = data.amounts.find((a) => a.subjectId === subjectId && a.fiscalYear === fiscalYear)
    return cell?.amount || "0"
  }

  function handleCellClick(subjectId: string, fiscalYear: number, isActual: boolean) {
    if (data.isReadOnly || isActual) return

    const amount = getAmount(subjectId, fiscalYear)
    setEditingCell({
      subjectId,
      fiscalYear,
      value: formatAmount(amount),
    })
  }

  function handleCellChange(value: string) {
    if (!editingCell) return
    setEditingCell({ ...editingCell, value })
  }

  function handleCellBlur() {
    if (!editingCell) return

    const key = `${editingCell.subjectId}-${editingCell.fiscalYear}`
    const parsedAmount = parseAmount(editingCell.value)

    const newPendingSaves = new Map(pendingSaves)
    newPendingSaves.set(key, {
      subjectId: editingCell.subjectId,
      fiscalYear: editingCell.fiscalYear,
      amount: parsedAmount,
      isActual: false,
    })
    setPendingSaves(newPendingSaves)
    setEditingCell(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!editingCell) return

    if (e.key === "Enter") {
      e.preventDefault()
      handleCellBlur()
      // Move to next row
      const currentIndex = data.subjects.findIndex((s) => s.id === editingCell.subjectId)
      if (currentIndex < data.subjects.length - 1) {
        const nextSubject = data.subjects[currentIndex + 1]
        if (!nextSubject.isAggregate) {
          handleCellClick(nextSubject.id, editingCell.fiscalYear, false)
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null)
    } else if (e.key === "Tab") {
      e.preventDefault()
      handleCellBlur()
      // Move to next column
      const currentColIndex = data.columns.findIndex((c) => c.fiscalYear === editingCell.fiscalYear && !c.isActual)
      const planColumns = data.columns.filter((c) => !c.isActual)
      if (currentColIndex < planColumns.length - 1) {
        const nextCol = planColumns[currentColIndex + 1]
        handleCellClick(editingCell.subjectId, nextCol.fiscalYear, false)
      }
    }
  }

  function calculateTotal(fiscalYear: number): string {
    const total = data.subjects
      .filter((s) => !s.isAggregate)
      .reduce((sum, subject) => {
        const amount = getAmount(subject.id, fiscalYear)
        return sum + Number.parseFloat(amount)
      }, 0)
    return total.toString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>数値入力グリッド</span>
          {data.isReadOnly && <span className="text-sm font-normal text-muted-foreground">（読み取り専用）</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-card font-semibold">科目</TableHead>
                {data.columns.map((col) => (
                  <TableHead key={`${col.fiscalYear}-${col.isActual}`} className="text-right font-semibold">
                    FY{col.fiscalYear}
                    <br />
                    <span className="text-xs text-muted-foreground">{col.isActual ? "実績" : "計画"}</span>
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold">計画合計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.subjects.map((subject) => (
                <TableRow key={subject.id} className={cn(subject.isAggregate && "bg-muted/50 font-semibold")}>
                  <TableCell className="sticky left-0 z-10 bg-card">{subject.subjectName}</TableCell>
                  {data.columns.map((col) => {
                    const amount = getAmount(subject.id, col.fiscalYear)
                    const isEditing =
                      editingCell?.subjectId === subject.id && editingCell?.fiscalYear === col.fiscalYear
                    const isEditable = !data.isReadOnly && !col.isActual && !subject.isAggregate

                    return (
                      <TableCell
                        key={`${subject.id}-${col.fiscalYear}-${col.isActual}`}
                        className={cn(
                          "text-right tabular-nums",
                          col.isActual && "bg-muted text-muted-foreground",
                          !col.isActual && data.isReadOnly && "bg-muted/50",
                          isEditable && "cursor-pointer hover:bg-accent",
                          subject.isAggregate && "font-semibold",
                        )}
                        onClick={() => handleCellClick(subject.id, col.fiscalYear, col.isActual)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingCell.value}
                            onChange={(e) => handleCellChange(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-right outline-none focus:bg-accent"
                            autoFocus
                          />
                        ) : (
                          formatAmount(amount)
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell
                    className={cn(
                      "bg-muted/50 text-right font-semibold tabular-nums",
                      subject.isAggregate && "font-bold",
                    )}
                  >
                    {formatAmount(
                      data.columns
                        .filter((c) => !c.isActual)
                        .reduce((sum, col) => sum + Number.parseFloat(getAmount(subject.id, col.fiscalYear)), 0)
                        .toString(),
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
