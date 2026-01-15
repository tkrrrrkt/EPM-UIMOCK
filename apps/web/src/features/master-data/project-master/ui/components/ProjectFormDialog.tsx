"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { BffProjectDetailResponse, ProjectStatus } from "@epm/contracts/bff/project-master"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProject?: BffProjectDetailResponse | null
  onSubmit: (data: ProjectFormData) => Promise<void>
}

export interface ProjectFormData {
  projectCode: string
  projectName: string
  projectNameShort?: string
  projectType?: string
  projectStatus?: ProjectStatus
  startDate?: string
  endDate?: string
  externalRef?: string
  notes?: string
}

export function ProjectFormDialog({ open, onOpenChange, editingProject, onSubmit }: ProjectFormDialogProps) {
  const isEdit = !!editingProject
  const [formData, setFormData] = useState<ProjectFormData>({
    projectCode: "",
    projectName: "",
    projectNameShort: "",
    projectType: "",
    projectStatus: "PLANNED",
    startDate: "",
    endDate: "",
    externalRef: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingProject) {
      setFormData({
        projectCode: editingProject.projectCode,
        projectName: editingProject.projectName,
        projectNameShort: editingProject.projectNameShort || "",
        projectType: editingProject.projectType || "",
        projectStatus: editingProject.projectStatus,
        startDate: editingProject.startDate || "",
        endDate: editingProject.endDate || "",
        externalRef: editingProject.externalRef || "",
        notes: editingProject.notes || "",
      })
    } else {
      setFormData({
        projectCode: "",
        projectName: "",
        projectNameShort: "",
        projectType: "",
        projectStatus: "PLANNED",
        startDate: "",
        endDate: "",
        externalRef: "",
        notes: "",
      })
    }
    setErrors({})
  }, [editingProject, open])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {}

    if (!formData.projectCode.trim()) {
      newErrors.projectCode = "プロジェクトコードは必須です"
    }

    if (!formData.projectName.trim()) {
      newErrors.projectName = "プロジェクト名は必須です"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Submit error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "プロジェクト編集" : "新規プロジェクト登録"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "プロジェクト情報を編集します" : "新しいプロジェクトを登録します"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectCode">
                  プロジェクトコード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectCode"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  disabled={isEdit}
                  className={errors.projectCode ? "border-destructive" : ""}
                />
                {errors.projectCode && <p className="text-sm text-destructive">{errors.projectCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectStatus">ステータス</Label>
                <Select
                  value={formData.projectStatus}
                  onValueChange={(value) => setFormData({ ...formData, projectStatus: value as ProjectStatus })}
                >
                  <SelectTrigger id="projectStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">計画中</SelectItem>
                    <SelectItem value="ACTIVE">実行中</SelectItem>
                    <SelectItem value="ON_HOLD">保留中</SelectItem>
                    <SelectItem value="CLOSED">完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">
                プロジェクト名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className={errors.projectName ? "border-destructive" : ""}
              />
              {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectNameShort">プロジェクト名略称</Label>
                <Input
                  id="projectNameShort"
                  value={formData.projectNameShort}
                  onChange={(e) => setFormData({ ...formData, projectNameShort: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">プロジェクトタイプ</Label>
                <Input
                  id="projectType"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  placeholder="例: CAPEX, OPEX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">開始日</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">終了日</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalRef">外部参照キー</Label>
              <Input
                id="externalRef"
                value={formData.externalRef}
                onChange={(e) => setFormData({ ...formData, externalRef: e.target.value })}
                placeholder="例: SAP-PS-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : isEdit ? "更新" : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
