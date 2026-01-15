"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/components/dialog"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Textarea } from "@/shared/ui/components/textarea"
import { Label } from "@/shared/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type {
  BffActionPlanDetail,
  BffUpdatePlanRequest,
  BffKpiSubject,
  ActionPlanStatus,
  ActionPlanPriority,
} from "../types"

interface ActionPlanEditDialogProps {
  open: boolean
  plan: BffActionPlanDetail | null
  kpiSubjects: BffKpiSubject[]
  onClose: () => void
  onSubmit: (id: string, data: BffUpdatePlanRequest) => Promise<void>
}

export function ActionPlanEditDialog({ open, plan, kpiSubjects, onClose, onSubmit }: ActionPlanEditDialogProps) {
  const [formData, setFormData] = useState<Partial<BffUpdatePlanRequest>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>("")

  useEffect(() => {
    if (plan && open) {
      setFormData({
        planCode: plan.planCode,
        planName: plan.planName,
        description: plan.description || "",
        subjectId: plan.subjectId,
        startDate: plan.startDate || "",
        dueDate: plan.dueDate || "",
        status: plan.status,
        progressRate: plan.progressRate || 0,
        priority: plan.priority || undefined,
        updatedAt: plan.updatedAt,
      })
    }
  }, [plan, open])

  const handleSubmit = async () => {
    if (!plan) return

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

    if (formData.progressRate !== undefined && (formData.progressRate < 0 || formData.progressRate > 100)) {
      newErrors.progressRate = "進捗率は0〜100の範囲で入力してください"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setApiError("")

    try {
      await onSubmit(plan.id, formData as BffUpdatePlanRequest)
      setFormData({})
      setErrors({})
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PLAN_CODE_DUPLICATE") {
          setApiError("プランコードが重複しています")
        } else if (error.message === "OPTIMISTIC_LOCK_ERROR") {
          setApiError("他のユーザーが更新しました。画面を更新してください")
        } else {
          setApiError("アクションプランの更新に失敗しました")
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

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">アクションプラン編集</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="edit-planCode" className="text-foreground">
              プランコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-planCode"
              value={formData.planCode || ""}
              onChange={(e) => {
                setFormData({ ...formData, planCode: e.target.value })
                setErrors({ ...errors, planCode: "" })
              }}
              maxLength={50}
            />
            {errors.planCode && <p className="text-sm text-destructive">{errors.planCode}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-planName" className="text-foreground">
              プラン名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-planName"
              value={formData.planName || ""}
              onChange={(e) => {
                setFormData({ ...formData, planName: e.target.value })
                setErrors({ ...errors, planName: "" })
              }}
              maxLength={200}
            />
            {errors.planName && <p className="text-sm text-destructive">{errors.planName}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description" className="text-foreground">
              説明
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-subjectId" className="text-foreground">
              紐付きKPI科目 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => {
                setFormData({ ...formData, subjectId: value })
                setErrors({ ...errors, subjectId: "" })
              }}
            >
              <SelectTrigger id="edit-subjectId">
                <SelectValue />
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
              <Label htmlFor="edit-startDate" className="text-foreground">
                開始日
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate" className="text-foreground">
                期限
              </Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="text-foreground">
                ステータス
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ActionPlanStatus })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">未着手</SelectItem>
                  <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                  <SelectItem value="COMPLETED">完了</SelectItem>
                  <SelectItem value="CANCELLED">中止</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-progressRate" className="text-foreground">
                進捗率 (%)
              </Label>
              <Input
                id="edit-progressRate"
                type="number"
                min={0}
                max={100}
                value={formData.progressRate || 0}
                onChange={(e) => {
                  setFormData({ ...formData, progressRate: Number.parseInt(e.target.value, 10) || 0 })
                  setErrors({ ...errors, progressRate: "" })
                }}
              />
              {errors.progressRate && <p className="text-sm text-destructive">{errors.progressRate}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-priority" className="text-foreground">
                優先度
              </Label>
              <Select
                value={formData.priority || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value === "none" ? undefined : (value as ActionPlanPriority) })
                }
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
