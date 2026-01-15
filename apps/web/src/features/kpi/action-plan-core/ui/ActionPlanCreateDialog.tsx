"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/components/dialog"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Textarea } from "@/shared/ui/components/textarea"
import { Label } from "@/shared/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { BffCreatePlanRequest, BffKpiSubject, ActionPlanPriority } from "../types"

interface ActionPlanCreateDialogProps {
  open: boolean
  kpiSubjects: BffKpiSubject[]
  onClose: () => void
  onSubmit: (data: BffCreatePlanRequest) => Promise<void>
}

export function ActionPlanCreateDialog({ open, kpiSubjects, onClose, onSubmit }: ActionPlanCreateDialogProps) {
  const [formData, setFormData] = useState<Partial<BffCreatePlanRequest>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>("")

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.planCode || formData.planCode.trim().length === 0) {
      newErrors.planCode = "プランコードは必須です"
    } else if (formData.planCode.length > 50) {
      newErrors.planCode = "プランコードは50文字以内で入力してください"
    }

    if (!formData.planName || formData.planName.trim().length === 0) {
      newErrors.planName = "プラン名は必須です"
    } else if (formData.planName.length > 200) {
      newErrors.planName = "プラン名は200文字以内で入力してください"
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "紐付きKPI科目は必須です"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setApiError("")

    try {
      await onSubmit(formData as BffCreatePlanRequest)
      setFormData({})
      setErrors({})
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PLAN_CODE_DUPLICATE") {
          setApiError("プランコードが重複しています")
        } else if (error.message === "INVALID_SUBJECT_TYPE") {
          setApiError("KPI科目のみ選択可能です")
        } else {
          setApiError("アクションプランの作成に失敗しました")
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({})
    setErrors({})
    setApiError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">アクションプラン新規作成</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="planCode" className="text-foreground">
              プランコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="planCode"
              value={formData.planCode || ""}
              onChange={(e) => {
                setFormData({ ...formData, planCode: e.target.value })
                setErrors({ ...errors, planCode: "" })
              }}
              placeholder="例: AP-2026-001"
              maxLength={50}
            />
            {errors.planCode && <p className="text-sm text-destructive">{errors.planCode}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="planName" className="text-foreground">
              プラン名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="planName"
              value={formData.planName || ""}
              onChange={(e) => {
                setFormData({ ...formData, planName: e.target.value })
                setErrors({ ...errors, planName: "" })
              }}
              placeholder="例: 売上拡大施策"
              maxLength={200}
            />
            {errors.planName && <p className="text-sm text-destructive">{errors.planName}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-foreground">
              説明
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="アクションプランの詳細を入力"
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subjectId" className="text-foreground">
              紐付きKPI科目 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => {
                setFormData({ ...formData, subjectId: value })
                setErrors({ ...errors, subjectId: "" })
              }}
            >
              <SelectTrigger id="subjectId">
                <SelectValue placeholder="KPI科目を選択" />
              </SelectTrigger>
              <SelectContent>
                {kpiSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.subjectCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate" className="text-foreground">
                開始日
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="text-foreground">
                期限
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority" className="text-foreground">
              優先度
            </Label>
            <Select
              value={formData.priority || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value === "none" ? undefined : (value as ActionPlanPriority) })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="優先度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未設定</SelectItem>
                <SelectItem value="HIGH">高</SelectItem>
                <SelectItem value="MEDIUM">中</SelectItem>
                <SelectItem value="LOW">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            作成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
