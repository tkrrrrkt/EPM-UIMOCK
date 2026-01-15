"use client"

import { useState, useEffect } from "react"
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui"
import { createBffClient, mockDepartments } from "../api"
import type {
  BffEmployeeAssignmentSummary,
  BffCreateEmployeeAssignmentRequest,
  BffUpdateEmployeeAssignmentRequest,
  AssignmentType,
} from "@epm/contracts/bff/employee-master"

interface EmployeeAssignmentFormProps {
  employeeId: string
  employeeHireDate: string | null
  assignment: BffEmployeeAssignmentSummary | null
  existingAssignments: BffEmployeeAssignmentSummary[]
  onClose: (shouldRefresh?: boolean) => void
  onError: (error: string) => void
}

interface FormData {
  departmentStableId: string
  assignmentType: AssignmentType
  allocationRatio: string
  title: string
  effectiveDate: string
  expiryDate: string
}

interface FormErrors {
  departmentStableId?: string
  assignmentType?: string
  allocationRatio?: string
  effectiveDate?: string
  expiryDate?: string
}

export function EmployeeAssignmentForm({
  employeeId,
  employeeHireDate,
  assignment,
  existingAssignments,
  onClose,
  onError,
}: EmployeeAssignmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    departmentStableId: "",
    assignmentType: "primary",
    allocationRatio: "100.00",
    title: "",
    effectiveDate: "",
    expiryDate: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const bffClient = createBffClient()
  const isEditMode = assignment !== null

  useEffect(() => {
    if (assignment) {
      setFormData({
        departmentStableId: assignment.departmentStableId,
        assignmentType: assignment.assignmentType,
        allocationRatio: assignment.allocationRatio?.toFixed(2) || "100.00",
        title: assignment.title || "",
        effectiveDate: assignment.effectiveDate,
        expiryDate: assignment.expiryDate || "",
      })
    }
  }, [assignment])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.departmentStableId) {
      newErrors.departmentStableId = "部門は必須です"
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "開始日は必須です"
    }

    // Validate effective date is after hire date
    if (formData.effectiveDate && employeeHireDate) {
      if (new Date(formData.effectiveDate) < new Date(employeeHireDate)) {
        newErrors.effectiveDate = "開始日は入社日以降の日付を指定してください"
      }
    }

    // Validate date range
    if (formData.effectiveDate && formData.expiryDate) {
      if (new Date(formData.expiryDate) <= new Date(formData.effectiveDate)) {
        newErrors.expiryDate = "終了日は開始日より後の日付を指定してください"
      }
    }

    // Validate allocation ratio for secondary assignments
    if (formData.assignmentType === "secondary") {
      const ratio = Number.parseFloat(formData.allocationRatio)
      if (isNaN(ratio) || ratio <= 0 || ratio > 100) {
        newErrors.allocationRatio = "按分率は0より大きく100以下の値を入力してください"
      }
    }

    // Validate primary assignment overlap
    if (formData.assignmentType === "primary") {
      const newStart = new Date(formData.effectiveDate)
      const newEnd = formData.expiryDate ? new Date(formData.expiryDate) : null

      const primaryAssignments = existingAssignments.filter((a) => {
        // Exclude current assignment if editing
        if (isEditMode && assignment && a.id === assignment.id) return false
        return a.assignmentType === "primary" && a.isActive
      })

      for (const existing of primaryAssignments) {
        const existingStart = new Date(existing.effectiveDate)
        const existingEnd = existing.expiryDate ? new Date(existing.expiryDate) : null

        // Check overlap
        const overlaps = (!existingEnd || newStart <= existingEnd) && (!newEnd || existingStart <= newEnd)

        if (overlaps) {
          newErrors.effectiveDate = "主務の期間が重複しています"
          break
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    onError("")

    try {
      if (isEditMode && assignment) {
        const request: BffUpdateEmployeeAssignmentRequest = {
          departmentStableId: formData.departmentStableId,
          assignmentType: formData.assignmentType,
          allocationRatio:
            formData.assignmentType === "secondary" ? Number.parseFloat(formData.allocationRatio) : undefined,
          title: formData.title || undefined,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || undefined,
        }
        await bffClient.updateEmployeeAssignment(employeeId, assignment.id, request)
      } else {
        const request: BffCreateEmployeeAssignmentRequest = {
          departmentStableId: formData.departmentStableId,
          assignmentType: formData.assignmentType,
          allocationRatio:
            formData.assignmentType === "secondary" ? Number.parseFloat(formData.allocationRatio) : undefined,
          title: formData.title || undefined,
          effectiveDate: formData.effectiveDate,
          expiryDate: formData.expiryDate || undefined,
        }
        await bffClient.createEmployeeAssignment(employeeId, request)
      }
      onClose(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "保存に失敗しました"
      if (errorMessage === "ASSIGNMENT_OVERLAP") {
        onError("主務の期間が重複しています")
      } else if (errorMessage === "DEPARTMENT_NOT_FOUND") {
        onError("指定された部門が見つかりません")
      } else {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAssignmentTypeChange = (value: AssignmentType) => {
    setFormData((prev) => ({
      ...prev,
      assignmentType: value,
      allocationRatio: value === "primary" ? "100.00" : prev.allocationRatio,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "所属履歴編集" : "所属履歴追加"}</CardTitle>
        <CardDescription>社員の所属情報を入力します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">
              部門 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.departmentStableId}
              onValueChange={(val) => handleInputChange("departmentStableId", val)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="部門を選択" />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.stableId} value={dept.stableId}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentStableId && <p className="text-sm text-destructive">{errors.departmentStableId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">役職</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="課長"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>
              主務/兼務 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={formData.assignmentType} onValueChange={handleAssignmentTypeChange} disabled={loading}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primary" id="primary" />
                <Label htmlFor="primary" className="font-normal cursor-pointer">
                  主務
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secondary" id="secondary" />
                <Label htmlFor="secondary" className="font-normal cursor-pointer">
                  兼務
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.assignmentType === "secondary" && (
            <div className="space-y-2">
              <Label htmlFor="allocationRatio">按分率 (%)</Label>
              <Input
                id="allocationRatio"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.allocationRatio}
                onChange={(e) => handleInputChange("allocationRatio", e.target.value)}
                disabled={loading}
              />
              {errors.allocationRatio && <p className="text-sm text-destructive">{errors.allocationRatio}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">
              開始日 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => handleInputChange("effectiveDate", e.target.value)}
              disabled={loading}
            />
            {errors.effectiveDate && <p className="text-sm text-destructive">{errors.effectiveDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">終了日</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              disabled={loading}
            />
            {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate}</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => onClose()} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
