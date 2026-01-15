"use client"

import { useState, useEffect } from "react"
import { Button, Input, Label, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDescription } from "@/shared/ui"
import { createBffClient } from "../api"
import type {
  BffEmployeeDetailResponse,
  BffCreateEmployeeRequest,
  BffUpdateEmployeeRequest,
} from "@epm/contracts/bff/employee-master"
import { EmployeeAssignmentSection } from "./EmployeeAssignmentSection"

interface EmployeeDetailDialogProps {
  open: boolean
  employeeId: string | null
  onClose: (shouldRefresh?: boolean) => void
}

interface FormData {
  employeeCode: string
  employeeName: string
  employeeNameKana: string
  email: string
  hireDate: string
  leaveDate: string
}

interface FormErrors {
  employeeCode?: string
  employeeName?: string
  hireDate?: string
  leaveDate?: string
  general?: string
}

export function EmployeeDetailDialog({ open, employeeId, onClose }: EmployeeDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [employee, setEmployee] = useState<BffEmployeeDetailResponse | null>(null)
  const [formData, setFormData] = useState<FormData>({
    employeeCode: "",
    employeeName: "",
    employeeNameKana: "",
    email: "",
    hireDate: "",
    leaveDate: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [activeTab, setActiveTab] = useState<string>("basic")

  const bffClient = createBffClient()
  const isEditMode = employeeId !== null

  useEffect(() => {
    if (open && employeeId) {
      loadEmployee()
    } else if (open && !employeeId) {
      resetForm()
    }
  }, [open, employeeId])

  const loadEmployee = async () => {
    if (!employeeId) return

    setLoading(true)
    setErrors({})

    try {
      const data = await bffClient.getEmployeeDetail(employeeId)
      setEmployee(data)
      setFormData({
        employeeCode: data.employeeCode,
        employeeName: data.employeeName,
        employeeNameKana: data.employeeNameKana || "",
        email: data.email || "",
        hireDate: data.hireDate || "",
        leaveDate: data.leaveDate || "",
      })
    } catch (err) {
      setErrors({ general: "社員情報の取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmployee(null)
    setFormData({
      employeeCode: "",
      employeeName: "",
      employeeNameKana: "",
      email: "",
      hireDate: "",
      leaveDate: "",
    })
    setErrors({})
    setActiveTab("basic")
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = "社員コードは必須です"
    }

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = "氏名は必須です"
    }

    if (formData.hireDate && formData.leaveDate) {
      if (new Date(formData.leaveDate) <= new Date(formData.hireDate)) {
        newErrors.leaveDate = "退職日は入社日より後の日付を指定してください"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab("basic")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      if (isEditMode && employeeId) {
        const request: BffUpdateEmployeeRequest = {
          employeeCode: formData.employeeCode,
          employeeName: formData.employeeName,
          employeeNameKana: formData.employeeNameKana || undefined,
          email: formData.email || undefined,
          hireDate: formData.hireDate || undefined,
          leaveDate: formData.leaveDate || undefined,
        }
        await bffClient.updateEmployee(employeeId, request)
      } else {
        const request: BffCreateEmployeeRequest = {
          employeeCode: formData.employeeCode,
          employeeName: formData.employeeName,
          employeeNameKana: formData.employeeNameKana || undefined,
          email: formData.email || undefined,
          hireDate: formData.hireDate || undefined,
          leaveDate: formData.leaveDate || undefined,
        }
        await bffClient.createEmployee(request)
      }
      onClose(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "保存に失敗しました"
      if (errorMessage === "EMPLOYEE_CODE_DUPLICATE") {
        setErrors({ general: "社員コードが重複しています" })
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!employeeId || !confirm("この社員を無効化しますか？")) return

    setLoading(true)
    setErrors({})

    try {
      await bffClient.deactivateEmployee(employeeId)
      onClose(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "無効化に失敗しました"
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!employeeId || !confirm("この社員を再有効化しますか?")) return

    setLoading(true)
    setErrors({})

    try {
      await bffClient.reactivateEmployee(employeeId)
      onClose(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "再有効化に失敗しました"
      setErrors({ general: errorMessage })
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] min-w-[1400px] max-w-[2000px] h-[95vh] flex flex-col overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEditMode ? "社員編集" : "社員登録"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "社員の基本情報と所属履歴を編集します" : "新しい社員を登録します"}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <Alert variant="destructive">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="assignments" disabled={!isEditMode}>
              所属履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6 overflow-y-auto flex-1 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employeeCode" className="text-base">
                  社員コード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="employeeCode"
                  value={formData.employeeCode}
                  onChange={(e) => handleInputChange("employeeCode", e.target.value)}
                  placeholder="A00123"
                  disabled={loading}
                  className="h-11 text-base"
                />
                {errors.employeeCode && <p className="text-sm text-destructive">{errors.employeeCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeName" className="text-base">
                  氏名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange("employeeName", e.target.value)}
                  placeholder="山田 太郎"
                  disabled={loading}
                  className="h-11 text-base"
                />
                {errors.employeeName && <p className="text-sm text-destructive">{errors.employeeName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeNameKana" className="text-base">
                  氏名カナ
                </Label>
                <Input
                  id="employeeNameKana"
                  value={formData.employeeNameKana}
                  onChange={(e) => handleInputChange("employeeNameKana", e.target.value)}
                  placeholder="ヤマダ タロウ"
                  disabled={loading}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="yamada@example.com"
                  disabled={loading}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate" className="text-base">
                  入社日
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange("hireDate", e.target.value)}
                  disabled={loading}
                  className="h-11 text-base"
                />
                {errors.hireDate && <p className="text-sm text-destructive">{errors.hireDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveDate" className="text-base">
                  退職日
                </Label>
                <Input
                  id="leaveDate"
                  type="date"
                  value={formData.leaveDate}
                  onChange={(e) => handleInputChange("leaveDate", e.target.value)}
                  disabled={loading}
                  className="h-11 text-base"
                />
                {errors.leaveDate && <p className="text-sm text-destructive">{errors.leaveDate}</p>}
              </div>
            </div>

            {isEditMode && employee && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium">有効状態:</span>
                  <Badge variant={employee.isActive ? "default" : "secondary"} className="text-base px-3 py-1">
                    {employee.isActive ? "有効" : "無効"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">作成日時:</span>{" "}
                    {new Date(employee.createdAt).toLocaleString("ja-JP")}
                  </div>
                  <div>
                    <span className="font-medium">更新日時:</span>{" "}
                    {new Date(employee.updatedAt).toLocaleString("ja-JP")}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="mt-6 flex-1 overflow-y-auto px-2">
            {isEditMode && employeeId && (
              <EmployeeAssignmentSection
                employeeId={employeeId}
                employeeHireDate={formData.hireDate}
                onError={(error) => setErrors({ general: error })}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="flex-1 flex gap-3">
            {isEditMode && employee && (
              <Button
                variant={employee.isActive ? "destructive" : "secondary"}
                onClick={employee.isActive ? handleDeactivate : handleReactivate}
                disabled={loading}
                className="h-11 text-base"
              >
                {employee.isActive ? "無効化" : "再有効化"}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onClose()} disabled={loading} className="h-11 text-base px-6">
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={loading} className="h-11 text-base px-6">
              {loading ? "保存中..." : isEditMode ? "更新" : "登録"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
