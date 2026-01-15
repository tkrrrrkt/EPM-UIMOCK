"use client"

import { useEffect, useState } from "react"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import type {
  BffCreateLaborCostRateRequest,
  BffUpdateLaborCostRateRequest,
  BffLaborCostRateDetailResponse,
  BffLaborCostRateItemInput,
  BffSubject,
  ResourceType,
  RateType,
} from "../types/bff-contracts"
import { getErrorMessage } from "../lib/error-messages"
import {
  validateRateCode,
  validateJobCategory,
  validateGrade,
  validateEmploymentType,
  validateVendorName,
  validateDateRange,
  validateItems,
  validateItemAmount,
} from "../lib/validation"
import { formatAmount } from "../lib/format"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Alert,
  AlertDescription,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui"

interface FormItemInput {
  subjectId: string
  amount: string
  displayOrder: number
}

interface FormDialogProps {
  rateId: string | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function FormDialog({ rateId, open, onClose, onSuccess }: FormDialogProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [existingData, setExistingData] = useState<BffLaborCostRateDetailResponse | null>(null)
  const [subjects, setSubjects] = useState<BffSubject[]>([])

  // Form fields
  const [rateCode, setRateCode] = useState("")
  const [resourceType, setResourceType] = useState<ResourceType>("EMPLOYEE")
  const [vendorName, setVendorName] = useState("")
  const [jobCategory, setJobCategory] = useState("")
  const [grade, setGrade] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [rateType, setRateType] = useState<RateType>("MONTHLY")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<FormItemInput[]>([])

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!rateId

  // Calculate total rate from items
  const totalRate = items.reduce((sum, item) => {
    const amount = Number.parseFloat(item.amount) || 0
    return sum + amount
  }, 0)

  useEffect(() => {
    if (open) {
      loadSubjects()
      if (rateId) {
        loadExistingData()
      } else {
        resetForm()
      }
    } else {
      resetForm()
      setApiError(null)
    }
  }, [open, rateId])

  async function loadSubjects() {
    try {
      const response = await client.listSubjects()
      setSubjects(response.items)
    } catch (err) {
      console.error("Failed to load subjects:", err)
    }
  }

  async function loadExistingData() {
    if (!rateId) return

    try {
      setLoading(true)
      const detail = await client.getLaborCostRateDetail(rateId)
      setExistingData(detail)
      setRateCode(detail.rateCode)
      setResourceType(detail.resourceType)
      setVendorName(detail.vendorName || "")
      setJobCategory(detail.jobCategory)
      setGrade(detail.grade || "")
      setEmploymentType(detail.employmentType || "")
      setRateType(detail.rateType)
      setEffectiveDate(detail.effectiveDate)
      setExpiryDate(detail.expiryDate || "")
      setNotes(detail.notes || "")
      // Convert items from response to form items
      setItems(
        detail.items.map((item) => ({
          subjectId: item.subjectId,
          amount: item.amount,
          displayOrder: item.displayOrder,
        })),
      )
    } catch (err) {
      if (err instanceof BffClientError) {
        setApiError(getErrorMessage(err.error.code))
      } else {
        setApiError("データの取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setRateCode("")
    setResourceType("EMPLOYEE")
    setVendorName("")
    setJobCategory("")
    setGrade("")
    setEmploymentType("")
    setRateType("MONTHLY")
    setEffectiveDate("")
    setExpiryDate("")
    setNotes("")
    setItems([{ subjectId: "", amount: "", displayOrder: 1 }])
    setErrors({})
    setExistingData(null)
  }

  function handleAddItem() {
    const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.displayOrder)) : 0
    setItems([...items, { subjectId: "", amount: "", displayOrder: maxOrder + 1 }])
  }

  function handleRemoveItem(index: number) {
    if (items.length <= 1) return
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  function handleItemChange(index: number, field: "subjectId" | "amount", value: string) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    const rateCodeError = validateRateCode(rateCode)
    if (rateCodeError) newErrors.rateCode = rateCodeError

    const jobCategoryError = validateJobCategory(jobCategory)
    if (jobCategoryError) newErrors.jobCategory = jobCategoryError

    const gradeError = validateGrade(grade)
    if (gradeError) newErrors.grade = gradeError

    const employmentTypeError = validateEmploymentType(employmentType)
    if (employmentTypeError) newErrors.employmentType = employmentTypeError

    const vendorNameError = validateVendorName(vendorName, resourceType)
    if (vendorNameError) newErrors.vendorName = vendorNameError

    const dateRangeError = validateDateRange(effectiveDate, expiryDate || null)
    if (dateRangeError) newErrors.dateRange = dateRangeError

    // Validate items
    const itemInputs: BffLaborCostRateItemInput[] = items.map((item) => ({
      subjectId: item.subjectId,
      amount: item.amount,
      displayOrder: item.displayOrder,
    }))
    const itemsError = validateItems(itemInputs)
    if (itemsError) newErrors.items = itemsError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) return

    try {
      setLoading(true)
      setApiError(null)

      const itemInputs: BffLaborCostRateItemInput[] = items.map((item) => ({
        subjectId: item.subjectId,
        amount: item.amount,
        displayOrder: item.displayOrder,
      }))

      if (isEditMode && rateId) {
        const request: BffUpdateLaborCostRateRequest = {
          rateCode,
          resourceType,
          vendorName: resourceType === "CONTRACTOR" ? vendorName : undefined,
          jobCategory,
          grade: grade || undefined,
          employmentType: resourceType === "EMPLOYEE" ? (employmentType || undefined) : undefined,
          rateType,
          effectiveDate,
          expiryDate: expiryDate || undefined,
          notes: notes || undefined,
          items: itemInputs,
        }
        await client.updateLaborCostRate(rateId, request)
      } else {
        const request: BffCreateLaborCostRateRequest = {
          rateCode,
          resourceType,
          vendorName: resourceType === "CONTRACTOR" ? vendorName : undefined,
          jobCategory,
          grade: grade || undefined,
          employmentType: resourceType === "EMPLOYEE" ? (employmentType || undefined) : undefined,
          rateType,
          effectiveDate,
          expiryDate: expiryDate || undefined,
          notes: notes || undefined,
          items: itemInputs,
        }
        await client.createLaborCostRate(request)
      }

      onSuccess()
      onClose()
    } catch (err) {
      if (err instanceof BffClientError) {
        setApiError(getErrorMessage(err.error.code))
      } else {
        setApiError("保存に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  // Get available subjects (not already selected, except current row)
  function getAvailableSubjects(currentSubjectId: string): BffSubject[] {
    const selectedIds = items.map((item) => item.subjectId).filter((id) => id && id !== currentSubjectId)
    return subjects.filter((subject) => !selectedIds.includes(subject.id))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "単価編集" : "単価新規登録"}</DialogTitle>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              単価コード <span className="text-destructive">*</span>
            </label>
            <Input
              value={rateCode}
              onChange={(e: any) => setRateCode(e.target.value)}
              placeholder="SE_G2_REGULAR"
              disabled={loading}
            />
            {errors.rateCode && <p className="text-sm text-destructive mt-1">{errors.rateCode}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                リソース区分 <span className="text-destructive">*</span>
              </label>
              <Select value={resourceType} onValueChange={(val) => setResourceType(val as ResourceType)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">社員</SelectItem>
                  <SelectItem value="CONTRACTOR">外注</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resourceType === "CONTRACTOR" ? (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  外注先名 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={vendorName}
                  onChange={(e: any) => setVendorName(e.target.value)}
                  placeholder="ABCシステムズ"
                  disabled={loading}
                />
                {errors.vendorName && <p className="text-sm text-destructive mt-1">{errors.vendorName}</p>}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">雇用区分</label>
                <Input
                  value={employmentType}
                  onChange={(e: any) => setEmploymentType(e.target.value)}
                  placeholder="REGULAR"
                  disabled={loading}
                />
                {errors.employmentType && <p className="text-sm text-destructive mt-1">{errors.employmentType}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                職種 <span className="text-destructive">*</span>
              </label>
              <Input
                value={jobCategory}
                onChange={(e: any) => setJobCategory(e.target.value)}
                placeholder="SE"
                disabled={loading}
              />
              {errors.jobCategory && <p className="text-sm text-destructive mt-1">{errors.jobCategory}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">等級</label>
              <Input
                value={grade}
                onChange={(e: any) => setGrade(e.target.value)}
                placeholder="G2"
                disabled={loading}
              />
              {errors.grade && <p className="text-sm text-destructive mt-1">{errors.grade}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                単価種別 <span className="text-destructive">*</span>
              </label>
              <Select value={rateType} onValueChange={(val) => setRateType(val as RateType)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">月額</SelectItem>
                  <SelectItem value="HOURLY">時給</SelectItem>
                  <SelectItem value="DAILY">日給</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">合計単価（自動計算）</label>
              <div className="h-10 px-3 py-2 border rounded-md bg-muted font-mono">
                {formatAmount(totalRate.toString())}
              </div>
            </div>
          </div>

          {/* Item breakdown section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  科目別内訳 <span className="text-destructive">*</span>
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={loading}>
                  <Plus className="h-4 w-4 mr-1" />
                  科目追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {errors.items && <p className="text-sm text-destructive mb-2">{errors.items}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">科目</TableHead>
                    <TableHead className="w-[150px]">金額</TableHead>
                    <TableHead className="w-[100px] text-right">構成比</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const amount = Number.parseFloat(item.amount) || 0
                    const percentage = totalRate > 0 ? ((amount / totalRate) * 100).toFixed(2) : "0.00"
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.subjectId}
                            onValueChange={(val) => handleItemChange(index, "subjectId", val)}
                            disabled={loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="科目を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableSubjects(item.subjectId).map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e: any) => handleItemChange(index, "amount", e.target.value)}
                            placeholder="0"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono">{percentage}%</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            disabled={loading || items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                有効開始日 <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e: any) => setEffectiveDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">有効終了日</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e: any) => setExpiryDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {errors.dateRange && <p className="text-sm text-destructive">{errors.dateRange}</p>}

          <div>
            <label className="text-sm font-medium mb-2 block">備考</label>
            <Textarea
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              placeholder="備考を入力"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
