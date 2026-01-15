"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import { formatAmount, FISCAL_MONTH_LABELS, FISCAL_MONTHS, getMonthLabel } from "../lib/format"
import type {
  BffResourcePlanSummary,
  BffDepartmentRef,
  AllocationType,
} from "@epm/contracts/bff/headcount-planning"

interface AllocationEntry {
  targetDepartmentStableId: string
  value: string // percentage or headcount amount
}

interface MonthlyAllocationEntry {
  targetDepartmentStableId: string
  value: string
}

interface AllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: BffResourcePlanSummary | null
  departments: BffDepartmentRef[]
  month?: number | null // For single month editing (when clicking on a cell)
  onSuccess: () => void
}

export function AllocationDialog({
  open,
  onOpenChange,
  plan,
  departments,
  month,
  onSuccess,
}: AllocationDialogProps) {
  const client = useBffClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allocationType, setAllocationType] = useState<AllocationType>("PERCENTAGE")
  const [settingMode, setSettingMode] = useState<"bulk" | "monthly">("bulk")

  // Bulk allocations (same for all months)
  const [allocations, setAllocations] = useState<AllocationEntry[]>([
    { targetDepartmentStableId: "", value: "" },
  ])

  // Monthly allocations
  const [monthlyAllocations, setMonthlyAllocations] = useState<
    Record<number, MonthlyAllocationEntry[]>
  >({})

  // Single month allocations (when editing a specific month)
  const [singleMonthAllocations, setSingleMonthAllocations] = useState<AllocationEntry[]>([
    { targetDepartmentStableId: "", value: "" },
  ])

  // Check if this is single month mode
  const isSingleMonthMode = month !== undefined && month !== null

  // Initialize when dialog opens
  useEffect(() => {
    if (open && plan) {
      setAllocationType("PERCENTAGE")
      setSettingMode("bulk")
      setAllocations([{ targetDepartmentStableId: "", value: "" }])
      setMonthlyAllocations({})
      setSingleMonthAllocations([{ targetDepartmentStableId: "", value: "" }])
      setError(null)
    }
  }, [open, plan])

  // Calculate totals
  const bulkTotal = allocations.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0)
  const singleMonthTotal = singleMonthAllocations.reduce(
    (sum, a) => sum + (parseFloat(a.value) || 0),
    0
  )
  const getMonthTotal = (m: number) => {
    const entries = monthlyAllocations[m] ?? []
    return entries.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0)
  }

  // Add/remove bulk allocations
  const addAllocation = () => {
    setAllocations([...allocations, { targetDepartmentStableId: "", value: "" }])
  }

  const removeAllocation = (index: number) => {
    if (allocations.length <= 1) return
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  const updateAllocation = (index: number, field: keyof AllocationEntry, value: string) => {
    const updated = [...allocations]
    updated[index] = { ...updated[index], [field]: value }
    setAllocations(updated)
  }

  // Single month allocation management
  const addSingleMonthAllocation = () => {
    setSingleMonthAllocations([
      ...singleMonthAllocations,
      { targetDepartmentStableId: "", value: "" },
    ])
  }

  const removeSingleMonthAllocation = (index: number) => {
    if (singleMonthAllocations.length <= 1) return
    setSingleMonthAllocations(singleMonthAllocations.filter((_, i) => i !== index))
  }

  const updateSingleMonthAllocation = (
    index: number,
    field: keyof AllocationEntry,
    value: string
  ) => {
    const updated = [...singleMonthAllocations]
    updated[index] = { ...updated[index], [field]: value }
    setSingleMonthAllocations(updated)
  }

  // Monthly allocation management
  const addMonthlyAllocation = (m: number) => {
    setMonthlyAllocations((prev) => ({
      ...prev,
      [m]: [...(prev[m] ?? []), { targetDepartmentStableId: "", value: "" }],
    }))
  }

  const removeMonthlyAllocation = (m: number, index: number) => {
    setMonthlyAllocations((prev) => {
      const entries = prev[m] ?? []
      if (entries.length <= 1) return prev
      return {
        ...prev,
        [m]: entries.filter((_, i) => i !== index),
      }
    })
  }

  const updateMonthlyAllocation = (
    m: number,
    index: number,
    field: keyof MonthlyAllocationEntry,
    value: string
  ) => {
    setMonthlyAllocations((prev) => {
      const entries = [...(prev[m] ?? [])]
      entries[index] = { ...entries[index], [field]: value }
      return { ...prev, [m]: entries }
    })
  }

  // Initialize monthly allocations for all months
  useEffect(() => {
    if (settingMode === "monthly" && !isSingleMonthMode) {
      const initial: Record<number, MonthlyAllocationEntry[]> = {}
      FISCAL_MONTHS.forEach((m) => {
        if (!monthlyAllocations[m] || monthlyAllocations[m].length === 0) {
          initial[m] = [{ targetDepartmentStableId: "", value: "" }]
        }
      })
      if (Object.keys(initial).length > 0) {
        setMonthlyAllocations((prev) => ({ ...prev, ...initial }))
      }
    }
  }, [settingMode, monthlyAllocations, isSingleMonthMode])

  const handleSubmit = async () => {
    if (!plan) return

    // Validation
    let entries: AllocationEntry[]
    if (isSingleMonthMode) {
      entries = singleMonthAllocations
    } else if (settingMode === "bulk") {
      entries = allocations
    } else {
      entries = Object.values(monthlyAllocations).flat()
    }

    const validEntries = entries.filter((e) => e.targetDepartmentStableId && e.value)

    if (validEntries.length === 0) {
      setError("配賦先を設定してください")
      return
    }

    // Check for duplicate departments (only for bulk/single month mode)
    if (isSingleMonthMode || settingMode === "bulk") {
      const deptIds = validEntries.map((e) => e.targetDepartmentStableId)
      const uniqueDepts = new Set(deptIds)
      if (deptIds.length !== uniqueDepts.size) {
        setError("同じ配賦先部門が複数指定されています")
        return
      }
    }

    try {
      setSubmitting(true)
      setError(null)

      await client.updateResourceAllocations(plan.id, {
        allocationType,
        allocations: validEntries.map((e) => ({
          targetDepartmentStableId: e.targetDepartmentStableId,
          percentage: allocationType === "PERCENTAGE" ? e.value : undefined,
          headcountAmount: allocationType === "HEADCOUNT" ? e.value : undefined,
        })),
      })

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("保存に失敗しました")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderAllocationTable = (
    entries: AllocationEntry[] | MonthlyAllocationEntry[],
    onUpdate: (index: number, field: keyof AllocationEntry, value: string) => void,
    onRemove: (index: number) => void,
    onAdd: () => void,
    showTotalRow?: boolean
  ) => {
    const total = entries.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0)
    const rate = plan?.rate?.totalRate ?? plan?.customRate ?? "0"
    const totalAmount = entries.reduce((sum, a) => {
      const value = parseFloat(a.value) || 0
      return (
        sum +
        (allocationType === "PERCENTAGE"
          ? (parseFloat(rate) * 12 * value) / 100
          : parseFloat(rate) * value)
      )
    }, 0)

    return (
      <>
        <div className="border rounded-md">
          <div className="grid grid-cols-[2fr_120px_140px_50px] gap-3 px-4 py-2.5 bg-muted/50 border-b font-medium text-sm">
            <div>部門</div>
            <div className="text-right">{allocationType === "PERCENTAGE" ? "割合" : "人月"}</div>
            <div className="text-right">金額</div>
            <div></div>
          </div>

          {entries.map((entry, index) => {
            const value = parseFloat(entry.value) || 0
            const amount =
              allocationType === "PERCENTAGE"
                ? isSingleMonthMode
                  ? (parseFloat(rate) * value) / 100
                  : (parseFloat(rate) * 12 * value) / 100
                : parseFloat(rate) * value

            return (
              <div
                key={index}
                className="grid grid-cols-[2fr_120px_140px_50px] gap-3 px-4 py-2 items-center border-b last:border-b-0 hover:bg-muted/30"
              >
                <Select
                  value={entry.targetDepartmentStableId}
                  onValueChange={(val) => onUpdate(index, "targetDepartmentStableId", val)}
                  disabled={submitting}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="部門を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.stableId} value={dept.stableId}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step={allocationType === "PERCENTAGE" ? "0.1" : "0.01"}
                  min="0"
                  value={entry.value}
                  onChange={(e) => onUpdate(index, "value", e.target.value)}
                  className="h-8 text-right font-mono text-sm"
                  disabled={submitting}
                />

                <div className="text-right font-mono text-sm px-3 py-1.5 bg-muted/50 rounded-md">
                  {formatAmount(amount)}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={submitting || entries.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>

        {showTotalRow && (
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">合計</span>
              <div className="flex gap-8">
                <span className="font-mono">
                  {total.toFixed(allocationType === "PERCENTAGE" ? 1 : 2)}{" "}
                  {allocationType === "PERCENTAGE" ? "%" : "人月"}
                </span>
                <span className="font-mono w-[140px] text-right">{formatAmount(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="w-full"
          disabled={submitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          配賦先追加
        </Button>
      </>
    )
  }

  if (!plan) return null

  // Single month mode dialog (when clicking on a cell)
  if (isSingleMonthMode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent style={{ width: "900px", maxWidth: "95vw" }}>
          <DialogHeader>
            <DialogTitle className="text-base">
              {getMonthLabel(month)}の配賦設定: {plan.jobCategory}
              {plan.grade ? ` × ${plan.grade}` : ""}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* 入力方式選択 */}
            <RadioGroup
              value={allocationType}
              onValueChange={(val) => setAllocationType(val as AllocationType)}
              className="flex gap-6"
              disabled={submitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PERCENTAGE" id="single-percentage" />
                <Label htmlFor="single-percentage" className="font-normal text-sm cursor-pointer">
                  割合(%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HEADCOUNT" id="single-headcount" />
                <Label htmlFor="single-headcount" className="font-normal text-sm cursor-pointer">
                  人月数
                </Label>
              </div>
            </RadioGroup>

            {renderAllocationTable(
              singleMonthAllocations,
              updateSingleMonthAllocation,
              removeSingleMonthAllocation,
              addSingleMonthAllocation,
              true
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Full allocation dialog (when clicking "設定" button)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" style={{ width: "900px", maxWidth: "95vw" }}>
        <DialogHeader>
          <DialogTitle className="text-base">
            配賦設定: {plan.jobCategory}
            {plan.grade ? ` × ${plan.grade}` : ""} ({plan.totalHeadcount}人)
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* 入力方式選択 */}
          <RadioGroup
            value={allocationType}
            onValueChange={(val) => setAllocationType(val as AllocationType)}
            className="flex gap-6"
            disabled={submitting}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PERCENTAGE" id="alloc-percentage" />
              <Label htmlFor="alloc-percentage" className="font-normal text-sm cursor-pointer">
                割合(%)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HEADCOUNT" id="alloc-headcount" />
              <Label htmlFor="alloc-headcount" className="font-normal text-sm cursor-pointer">
                人月数
              </Label>
            </div>
          </RadioGroup>

          {/* 一括/月別切り替え */}
          <Tabs value={settingMode} onValueChange={(v) => setSettingMode(v as "bulk" | "monthly")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bulk" disabled={submitting}>
                一括設定
              </TabsTrigger>
              <TabsTrigger value="monthly" disabled={submitting}>
                月別設定
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bulk" className="space-y-4 mt-4">
              {renderAllocationTable(
                allocations,
                updateAllocation,
                removeAllocation,
                addAllocation,
                true
              )}

              {allocationType === "PERCENTAGE" && Math.abs(bulkTotal - 100) > 0.01 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    配賦率の合計が100%になっていません（現在: {bulkTotal.toFixed(1)}%）
                  </AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-muted-foreground">
                ※ 一括設定は全月に同じ配賦先・割合を適用します
              </p>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                {FISCAL_MONTHS.map((m, idx) => {
                  const entries = monthlyAllocations[m] ?? [
                    { targetDepartmentStableId: "", value: "" },
                  ]
                  const monthTotal = getMonthTotal(m)

                  return (
                    <div key={m} className="border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">{FISCAL_MONTH_LABELS[idx]}</h4>
                        <span className="text-sm text-muted-foreground">
                          合計: {monthTotal.toFixed(allocationType === "PERCENTAGE" ? 1 : 2)}
                          {allocationType === "PERCENTAGE" ? "%" : "人月"}
                        </span>
                      </div>
                      {renderAllocationTable(
                        entries,
                        (index, field, value) => updateMonthlyAllocation(m, index, field, value),
                        (index) => removeMonthlyAllocation(m, index),
                        () => addMonthlyAllocation(m)
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-sm text-muted-foreground">
                ※ 月別設定では各月ごとに異なる配賦先・割合を設定できます
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "予算反映"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
