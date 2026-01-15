"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
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
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import { formatAmount, formatPercentage } from "../lib/format"
import type {
  BffResourcePlanSummary,
  BffLaborCostRateForPlanningSummary,
  ResourceType,
  RateType,
} from "@epm/contracts/bff/headcount-planning"
import type { SearchParams } from "./SearchPanel"

interface ResourcePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editPlan?: BffResourcePlanSummary | null
  searchParams: SearchParams | null
  onSuccess: () => void
}

export function ResourcePlanDialog({
  open,
  onOpenChange,
  editPlan,
  searchParams,
  onSuccess,
}: ResourcePlanDialogProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rate options
  const [rates, setRates] = useState<BffLaborCostRateForPlanningSummary[]>([])
  const [selectedRateDetail, setSelectedRateDetail] = useState<{
    items: { subjectName: string; amount: string; percentage: string }[]
  } | null>(null)

  // Form state
  const [resourceType, setResourceType] = useState<ResourceType>("EMPLOYEE")
  const [jobCategory, setJobCategory] = useState("")
  const [grade, setGrade] = useState("")
  const [rateType, setRateType] = useState<RateType>("MONTHLY")
  const [rateId, setRateId] = useState<string>("")
  const [customRate, setCustomRate] = useState("")
  const [useCustomRate, setUseCustomRate] = useState(false)
  const [notes, setNotes] = useState("")

  const isEditMode = !!editPlan

  // Load rates when dialog opens or resource type changes
  useEffect(() => {
    if (!open || !searchParams) return

    async function loadRates() {
      try {
        setLoading(true)
        const response = await client.listLaborCostRates({
          companyId: searchParams!.companyId,
          resourceType,
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
  }, [client, open, searchParams, resourceType])

  // Load rate detail when rate is selected
  useEffect(() => {
    if (!rateId || useCustomRate) {
      setSelectedRateDetail(null)
      return
    }

    async function loadRateDetail() {
      try {
        const detail = await client.getLaborCostRateDetail(rateId)
        setSelectedRateDetail({
          items: detail.items.map((item) => ({
            subjectName: item.subjectName,
            amount: item.amount,
            percentage: item.percentage,
          })),
        })
      } catch (err) {
        console.error("Failed to load rate detail:", err)
      }
    }

    loadRateDetail()
  }, [client, rateId, useCustomRate])

  // Initialize form when editing
  useEffect(() => {
    if (open && editPlan) {
      setResourceType(editPlan.resourceType)
      setJobCategory(editPlan.jobCategory)
      setGrade(editPlan.grade ?? "")
      setRateType(editPlan.rateType)
      if (editPlan.rate) {
        setRateId(editPlan.rate.id)
        setUseCustomRate(false)
      } else if (editPlan.customRate) {
        setCustomRate(editPlan.customRate)
        setUseCustomRate(true)
      }
    } else if (open && !editPlan) {
      // Reset form for new entry
      setResourceType("EMPLOYEE")
      setJobCategory("")
      setGrade("")
      setRateType("MONTHLY")
      setRateId("")
      setCustomRate("")
      setUseCustomRate(false)
      setNotes("")
    }
  }, [open, editPlan])

  const handleSubmit = async () => {
    if (!searchParams) return

    // Validation
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

    try {
      setSubmitting(true)
      setError(null)

      if (isEditMode && editPlan) {
        await client.updateResourcePlan(editPlan.id, {
          resourceType,
          jobCategory,
          grade: grade || undefined,
          rateId: useCustomRate ? undefined : rateId,
          customRate: useCustomRate ? customRate : undefined,
          rateType,
          notes: notes || undefined,
        })
      } else {
        await client.createResourcePlan({
          companyId: searchParams.companyId,
          planEventId: searchParams.planEventId,
          planVersionId: searchParams.planVersionId,
          sourceDepartmentStableId: searchParams.sourceDepartmentStableId,
          resourceType,
          jobCategory,
          grade: grade || undefined,
          rateId: useCustomRate ? undefined : rateId,
          customRate: useCustomRate ? customRate : undefined,
          rateType,
          notes: notes || undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "人員計画編集" : "人員追加"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* 区分 */}
          <div className="space-y-2">
            <Label>区分</Label>
            <RadioGroup
              value={resourceType}
              onValueChange={(val) => {
                setResourceType(val as ResourceType)
                setRateId("") // Reset rate when type changes
              }}
              className="flex gap-6"
              disabled={submitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EMPLOYEE" id="resource-employee" />
                <Label htmlFor="resource-employee" className="font-normal cursor-pointer">
                  社員
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONTRACTOR" id="resource-contractor" />
                <Label htmlFor="resource-contractor" className="font-normal cursor-pointer">
                  外注
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 職種・等級 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job-category">
                職種 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="job-category"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                placeholder="エンジニア"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">等級</Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="シニア"
                disabled={submitting}
              />
            </div>
          </div>

          {/* 単価種別 */}
          <div className="space-y-2">
            <Label>単価種別</Label>
            <RadioGroup
              value={rateType}
              onValueChange={(val) => {
                setRateType(val as RateType)
                setRateId("") // Reset rate when type changes
              }}
              className="flex gap-6"
              disabled={submitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MONTHLY" id="rate-monthly" />
                <Label htmlFor="rate-monthly" className="font-normal cursor-pointer">
                  月額
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="HOURLY" id="rate-hourly" />
                <Label htmlFor="rate-hourly" className="font-normal cursor-pointer">
                  時給
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DAILY" id="rate-daily" />
                <Label htmlFor="rate-daily" className="font-normal cursor-pointer">
                  日給
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 単価選択 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>単価選択</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-custom-rate"
                  checked={useCustomRate}
                  onChange={(e) => {
                    setUseCustomRate(e.target.checked)
                    if (e.target.checked) setRateId("")
                  }}
                  className="rounded border-gray-300"
                  disabled={submitting}
                />
                <Label htmlFor="use-custom-rate" className="font-normal text-sm cursor-pointer">
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
                placeholder="800000"
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
                    filteredRates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {rate.rateCode} ({rate.jobCategory}
                        {rate.grade ? `・${rate.grade}` : ""}) - {formatAmount(rate.totalRate)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 科目別内訳プレビュー */}
          {selectedRateDetail && (
            <Card className="border-muted">
              <CardHeader className="py-2 px-4 bg-muted/30">
                <CardTitle className="text-sm font-medium">科目別内訳</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>科目</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">割合</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRateDetail.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{item.subjectName}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatAmount(item.amount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatPercentage(item.percentage)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* メモ */}
          <div className="space-y-2">
            <Label htmlFor="notes">メモ</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="備考など"
              disabled={submitting}
            />
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
