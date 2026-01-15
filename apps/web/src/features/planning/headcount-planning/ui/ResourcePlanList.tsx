"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Pencil, Trash2, Settings, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import {
  formatAmount,
  formatHeadcount,
  formatRate,
  getResourceTypeLabel,
  FISCAL_MONTH_LABELS,
  FISCAL_MONTHS,
} from "../lib/format"
import type {
  BffListResourcePlansRequest,
  BffResourcePlanSummary,
  BffListResourcePlansResponse,
} from "@epm/contracts/bff/headcount-planning"
import type { SearchParams } from "./SearchPanel"

interface ResourcePlanListProps {
  searchParams: SearchParams | null
  onCreateNew: () => void
  onEdit: (plan: BffResourcePlanSummary) => void
  onAllocation: (plan: BffResourcePlanSummary) => void
  onMonthAllocation: (plan: BffResourcePlanSummary, month: number) => void
  onDelete: (planId: string) => void
  onMonthsChange: (planId: string, months: { periodMonth: number; headcount: string }[]) => void
}

export function ResourcePlanList({
  searchParams,
  onCreateNew,
  onEdit,
  onAllocation,
  onMonthAllocation,
  onDelete,
  onMonthsChange,
}: ResourcePlanListProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BffListResourcePlansResponse | null>(null)

  // Track edited month values
  const [editedMonths, setEditedMonths] = useState<Record<string, Record<number, string>>>({})

  // Track which cell is in edit mode (planId-periodMonth)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingClickRef = useRef<{ plan: BffResourcePlanSummary; periodMonth: number } | null>(null)

  const loadData = useCallback(async () => {
    if (!searchParams) return

    try {
      setLoading(true)
      setError(null)

      const request: BffListResourcePlansRequest = {
        companyId: searchParams.companyId,
        planEventId: searchParams.planEventId,
        planVersionId: searchParams.planVersionId,
        sourceDepartmentStableId: searchParams.sourceDepartmentStableId,
        resourceType: searchParams.resourceType,
      }

      const response = await client.listResourcePlans(request)
      setData(response)
      setEditedMonths({}) // Reset edited months on reload
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("データの取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }, [client, searchParams])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMonthChange = (planId: string, periodMonth: number, value: string) => {
    setEditedMonths((prev) => ({
      ...prev,
      [planId]: {
        ...(prev[planId] ?? {}),
        [periodMonth]: value,
      },
    }))
  }

  const handleMonthBlur = (plan: BffResourcePlanSummary, periodMonth: number) => {
    const edited = editedMonths[plan.id]
    if (!edited || edited[periodMonth] === undefined) return

    const newValue = edited[periodMonth]
    const originalMonth = plan.months.find((m) => m.periodMonth === periodMonth)
    if (originalMonth && newValue !== originalMonth.headcount) {
      // Create updated months array
      const updatedMonths = plan.months.map((m) =>
        m.periodMonth === periodMonth ? { periodMonth: m.periodMonth, headcount: newValue } : m
      )
      onMonthsChange(plan.id, updatedMonths)
    }
    // Exit edit mode
    setEditingCell(null)
  }

  const handleCellClick = (plan: BffResourcePlanSummary, periodMonth: number) => {
    const cellKey = `${plan.id}-${periodMonth}`
    // If already editing this cell, do nothing
    if (editingCell === cellKey) return

    // Store the click info for potential single-click action
    pendingClickRef.current = { plan, periodMonth }

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // Set a timeout to handle single click (wait for potential double-click)
    clickTimeoutRef.current = setTimeout(() => {
      // Only execute if this click wasn't cancelled by double-click
      if (pendingClickRef.current) {
        onMonthAllocation(pendingClickRef.current.plan, pendingClickRef.current.periodMonth)
        pendingClickRef.current = null
      }
      clickTimeoutRef.current = null
    }, 300) // 300ms to distinguish from double-click
  }

  const handleCellDoubleClick = (plan: BffResourcePlanSummary, periodMonth: number) => {
    // Cancel pending single-click action
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    pendingClickRef.current = null

    const cellKey = `${plan.id}-${periodMonth}`
    setEditingCell(cellKey)
    // Focus input after render
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    plan: BffResourcePlanSummary,
    periodMonth: number
  ) => {
    if (e.key === "Enter") {
      handleMonthBlur(plan, periodMonth)
    } else if (e.key === "Escape") {
      // Cancel edit and restore original value
      setEditedMonths((prev) => {
        const planEdits = { ...(prev[plan.id] ?? {}) }
        delete planEdits[periodMonth]
        return { ...prev, [plan.id]: planEdits }
      })
      setEditingCell(null)
    } else if (e.key === "Tab") {
      // Save and move to next cell
      handleMonthBlur(plan, periodMonth)
    }
  }

  const getMonthValue = (plan: BffResourcePlanSummary, periodMonth: number): string => {
    const edited = editedMonths[plan.id]
    if (edited && edited[periodMonth] !== undefined) {
      return edited[periodMonth]
    }
    const month = plan.months.find((m) => m.periodMonth === periodMonth)
    return month?.headcount ?? "0.00"
  }

  const calculateAnnualAmount = (plan: BffResourcePlanSummary): string => {
    const rate = parseFloat(plan.rate?.totalRate ?? plan.customRate ?? "0")
    const totalHeadcount = plan.months.reduce((sum, m) => {
      const edited = editedMonths[plan.id]
      const value = edited && edited[m.periodMonth] !== undefined ? edited[m.periodMonth] : m.headcount
      return sum + parseFloat(value || "0")
    }, 0)
    return (totalHeadcount * rate).toString()
  }

  if (!searchParams) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">職種×等級による人員計画</CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            人員追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            人員計画がありません。「人員追加」ボタンから登録してください。
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10 text-center whitespace-nowrap">#</TableHead>
                    <TableHead className="w-14 whitespace-nowrap">区分</TableHead>
                    <TableHead className="w-20 whitespace-nowrap">職種</TableHead>
                    <TableHead className="w-16 whitespace-nowrap">等級</TableHead>
                    <TableHead className="w-24 text-right whitespace-nowrap">単価</TableHead>
                    {FISCAL_MONTH_LABELS.map((label) => (
                      <TableHead key={label} className="w-[80px] text-center bg-primary/5 whitespace-nowrap">
                        {label}
                      </TableHead>
                    ))}
                    <TableHead className="w-28 text-right bg-accent/20 whitespace-nowrap">年間金額</TableHead>
                    <TableHead className="w-14 text-center whitespace-nowrap">配賦</TableHead>
                    <TableHead className="w-16 text-center whitespace-nowrap">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((plan, idx) => (
                    <TableRow key={plan.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={plan.resourceType === "EMPLOYEE" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {getResourceTypeLabel(plan.resourceType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{plan.jobCategory}</TableCell>
                      <TableCell className="text-sm">{plan.grade ?? "-"}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {plan.rate
                          ? formatRate(plan.rate.totalRate, plan.rate.rateType)
                          : plan.customRate
                          ? formatAmount(plan.customRate)
                          : "-"}
                      </TableCell>
                      {FISCAL_MONTHS.map((periodMonth) => {
                        const cellKey = `${plan.id}-${periodMonth}`
                        const isEditing = editingCell === cellKey

                        return (
                          <TableCell
                            key={periodMonth}
                            className="w-[80px] p-1 bg-primary/[0.02] cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isEditing) {
                                handleCellClick(plan, periodMonth)
                              }
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation()
                              handleCellDoubleClick(plan, periodMonth)
                            }}
                          >
                            {isEditing ? (
                              <Input
                                ref={inputRef}
                                type="number"
                                step="0.01"
                                min="0"
                                value={getMonthValue(plan, periodMonth)}
                                onChange={(e) => handleMonthChange(plan.id, periodMonth, e.target.value)}
                                onBlur={() => handleMonthBlur(plan, periodMonth)}
                                onKeyDown={(e) => handleCellKeyDown(e, plan, periodMonth)}
                                className="h-9 w-[70px] text-center font-mono text-sm px-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="h-9 w-[70px] flex items-center justify-center text-sm font-mono">
                                {formatHeadcount(getMonthValue(plan, periodMonth))}
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-right font-mono font-semibold text-sm bg-accent/10">
                        {formatAmount(calculateAnnualAmount(plan))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onAllocation(plan)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          設定
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEdit(plan)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onDelete(plan.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Summary */}
        {data && data.summary && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                社員 {formatHeadcount(data.summary.employeeCount)}人{" "}
                {formatAmount(data.summary.employeeAmount)} / 外注{" "}
                {formatHeadcount(data.summary.contractorCount)}人{" "}
                {formatAmount(data.summary.contractorAmount)}
              </span>
              <span className="font-semibold text-foreground">
                合計: {formatAmount(data.summary.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
