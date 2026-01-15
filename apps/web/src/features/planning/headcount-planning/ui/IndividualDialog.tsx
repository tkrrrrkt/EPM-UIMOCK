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
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import { formatAmount } from "../lib/format"
import type {
  BffIndividualAllocationSummary,
  BffDepartmentRef,
  BffLaborCostRateForPlanningSummary,
  RateType,
} from "@epm/contracts/bff/headcount-planning"
import type { SearchParams } from "./SearchPanel"

interface AllocationEntry {
  targetDepartmentStableId: string
  percentage: string
}

interface IndividualDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editIndividual?: BffIndividualAllocationSummary | null
  searchParams: SearchParams | null
  departments: BffDepartmentRef[]
  onSuccess: () => void
}

export function IndividualDialog({
  open,
  onOpenChange,
  editIndividual,
  searchParams,
  departments,
  onSuccess,
}: IndividualDialogProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rate options
  const [rates, setRates] = useState<BffLaborCostRateForPlanningSummary[]>([])

  // Form state
  const [individualName, setIndividualName] = useState("")
  const [jobCategory, setJobCategory] = useState("")
  const [grade, setGrade] = useState("")
  const [rateType, setRateType] = useState<RateType>("MONTHLY")
  const [rateId, setRateId] = useState<string>("")
  const [customRate, setCustomRate] = useState("")
  const [useCustomRate, setUseCustomRate] = useState(false)
  const [allocations, setAllocations] = useState<AllocationEntry[]>([
    { targetDepartmentStableId: "", percentage: "" },
  ])

  const isEditMode = !!editIndividual

  // Load rates when dialog opens
  useEffect(() => {
    if (!open || !searchParams) return

    async function loadRates() {
      try {
        setLoading(true)
        const response = await client.listLaborCostRates({
          companyId: searchParams!.companyId,
          resourceType: "EMPLOYEE",
          isActive: true,
        })
        setRates(response.items)
      } catch (err) {
        console.error("Failed to load rates:", err)
      } finally {
        setLoading(false)
      }
    }

    loadRates()
  }, [client, open, searchParams])

  // Initialize form when editing
  useEffect(() => {
    if (open && editIndividual) {
      setIndividualName(editIndividual.individualName)
      setJobCategory(editIndividual.jobCategory)
      setGrade(editIndividual.grade ?? "")
      setRateType(editIndividual.rateType)
      if (editIndividual.rate) {
        setRateId(editIndividual.rate.id)
        setUseCustomRate(false)
      } else if (editIndividual.customRate) {
        setCustomRate(editIndividual.customRate)
        setUseCustomRate(true)
      }
      setAllocations(
        editIndividual.allocations.map((a) => ({
          targetDepartmentStableId: a.targetDepartment.stableId,
          percentage: a.percentage,
        }))
      )
    } else if (open && !editIndividual) {
      // Reset form for new entry
      setIndividualName("")
      setJobCategory("")
      setGrade("")
      setRateType("MONTHLY")
      setRateId("")
      setCustomRate("")
      setUseCustomRate(false)
      setAllocations([{ targetDepartmentStableId: "", percentage: "" }])
    }
  }, [open, editIndividual])

  // Calculate totals
  const totalPercentage = allocations.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0)
  const rate = rates.find((r) => r.id === rateId)?.totalRate ?? customRate ?? "0"
  const totalAmount = (parseFloat(rate) * 12 * totalPercentage) / 100

  // Allocation management
  const addAllocation = () => {
    setAllocations([...allocations, { targetDepartmentStableId: "", percentage: "" }])
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

  const handleSubmit = async () => {
    if (!searchParams) return

    // Validation
    if (!individualName.trim()) {
      setError("氏名を入力してください")
      return
    }
    if (!jobCategory.trim()) {
      setError("職種を入力してください")
      return
    }
    if (!useCustomRate && !rateId) {
      setError("単価を選択してください")
      return
    }
    if (useCustomRate && !customRate.trim()) {
      setError("カスタム単価を入力してください")
      return
    }

    const validAllocations = allocations.filter((a) => a.targetDepartmentStableId && a.percentage)
    if (validAllocations.length === 0) {
      setError("配賦先を設定してください")
      return
    }

    // Check 100%
    const total = validAllocations.reduce((sum, a) => sum + parseFloat(a.percentage), 0)
    if (Math.abs(total - 100) > 0.01) {
      setError(`配賦率の合計が100%になっていません（現在: ${total.toFixed(1)}%）`)
      return
    }

    // Check for duplicate departments
    const deptIds = validAllocations.map((a) => a.targetDepartmentStableId)
    const uniqueDepts = new Set(deptIds)
    if (deptIds.length !== uniqueDepts.size) {
      setError("同じ配賦先部門が複数指定されています")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (isEditMode && editIndividual) {
        await client.updateIndividualAllocation(editIndividual.individualKey, {
          individualName,
          jobCategory,
          grade: grade || undefined,
          rateId: useCustomRate ? undefined : rateId,
          customRate: useCustomRate ? customRate : undefined,
          rateType,
          allocations: validAllocations,
        })
      } else {
        await client.createIndividualAllocation({
          companyId: searchParams.companyId,
          planEventId: searchParams.planEventId,
          planVersionId: searchParams.planVersionId,
          sourceDepartmentStableId: searchParams.sourceDepartmentStableId,
          individualName,
          jobCategory,
          grade: grade || undefined,
          rateId: useCustomRate ? undefined : rateId,
          customRate: useCustomRate ? customRate : undefined,
          rateType,
          allocations: validAllocations,
        })
      }

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

  // Filter rates by selected type
  const filteredRates = rates.filter((r) => r.rateType === rateType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "個人別配賦編集" : "個人別配賦追加"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="individual-name">
                氏名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="individual-name"
                value={individualName}
                onChange={(e) => setIndividualName(e.target.value)}
                placeholder="田中部長"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="individual-job">
                職種 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="individual-job"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                placeholder="管理職"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="individual-grade">等級</Label>
              <Input
                id="individual-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="部長"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>単価種別</Label>
              <RadioGroup
                value={rateType}
                onValueChange={(val) => {
                  setRateType(val as RateType)
                  setRateId("")
                }}
                className="flex gap-4 pt-2"
                disabled={submitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MONTHLY" id="ind-rate-monthly" />
                  <Label htmlFor="ind-rate-monthly" className="font-normal cursor-pointer">
                    月額
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HOURLY" id="ind-rate-hourly" />
                  <Label htmlFor="ind-rate-hourly" className="font-normal cursor-pointer">
                    時給
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DAILY" id="ind-rate-daily" />
                  <Label htmlFor="ind-rate-daily" className="font-normal cursor-pointer">
                    日給
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* 単価選択 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>単価選択</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ind-use-custom-rate"
                  checked={useCustomRate}
                  onChange={(e) => {
                    setUseCustomRate(e.target.checked)
                    if (e.target.checked) setRateId("")
                  }}
                  className="rounded border-gray-300"
                  disabled={submitting}
                />
                <Label
                  htmlFor="ind-use-custom-rate"
                  className="font-normal text-sm cursor-pointer"
                >
                  カスタム単価を入力
                </Label>
              </div>
            </div>

            {useCustomRate ? (
              <Input
                type="number"
                step="1"
                min="0"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                placeholder="1200000"
                disabled={submitting}
              />
            ) : (
              <Select value={rateId} onValueChange={setRateId} disabled={submitting || loading}>
                <SelectTrigger>
                  <SelectValue placeholder="単価マスタから選択" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredRates.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      該当する単価がありません
                    </div>
                  ) : (
                    filteredRates.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.rateCode} ({r.jobCategory}
                        {r.grade ? `・${r.grade}` : ""}) - {formatAmount(r.totalRate)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 配賦先設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                配賦先設定 <span className="text-destructive">*</span>
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addAllocation}
                disabled={submitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                配賦先追加
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">部門</TableHead>
                    <TableHead className="w-[150px] text-right">割合（%）</TableHead>
                    <TableHead className="w-[150px] text-right">年間金額</TableHead>
                    <TableHead className="w-[60px] text-center">削除</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation, index) => {
                    const pct = parseFloat(allocation.percentage) || 0
                    const amount = (parseFloat(rate) * 12 * pct) / 100

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={allocation.targetDepartmentStableId}
                            onValueChange={(val) =>
                              updateAllocation(index, "targetDepartmentStableId", val)
                            }
                            disabled={submitting}
                          >
                            <SelectTrigger>
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
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={allocation.percentage}
                            onChange={(e) => updateAllocation(index, "percentage", e.target.value)}
                            className="text-right font-mono"
                            disabled={submitting}
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatAmount(amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAllocation(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={submitting || allocations.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-sm font-medium">合計</span>
              <div className="flex gap-8">
                <span
                  className={`text-sm font-medium ${
                    Math.abs(totalPercentage - 100) > 0.01 ? "text-destructive" : ""
                  }`}
                >
                  {totalPercentage.toFixed(1)}%
                </span>
                <span className="text-sm font-medium">{formatAmount(totalAmount)}</span>
              </div>
            </div>

            {Math.abs(totalPercentage - 100) > 0.01 && (
              <Alert variant="destructive">
                <AlertDescription>配賦率の合計が100%になっていません</AlertDescription>
              </Alert>
            )}
          </div>
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
