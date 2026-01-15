"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/ui/components/sheet"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Textarea } from "@/shared/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Checkbox } from "@/shared/ui/components/checkbox"
import { Loader2, Trash2 } from "lucide-react"
import type { BffGanttWbs, BffCreateWbsRequest, BffUpdateWbsRequest } from "../types"

interface WbsEditSheetProps {
  open: boolean
  wbs: BffGanttWbs | null
  allWbsItems: BffGanttWbs[]
  onClose: () => void
  onSave: (request: BffCreateWbsRequest | BffUpdateWbsRequest) => Promise<void>
  onDelete?: () => void
  planId: string
}

export function WbsEditSheet({ open, wbs, allWbsItems, onClose, onSave, onDelete, planId }: WbsEditSheetProps) {
  const isEdit = !!wbs
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    wbsCode: "",
    wbsName: "",
    description: "",
    parentWbsId: "",
    assigneeDepartmentStableId: "",
    assigneeEmployeeId: "",
    startDate: "",
    dueDate: "",
    isMilestone: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (wbs) {
      setFormData({
        wbsCode: wbs.wbsCode,
        wbsName: wbs.wbsName,
        description: wbs.description || "",
        parentWbsId: wbs.parentWbsId || "",
        assigneeDepartmentStableId: wbs.assigneeDepartmentStableId || "",
        assigneeEmployeeId: wbs.assigneeEmployeeId || "",
        startDate: wbs.startDate || "",
        dueDate: wbs.dueDate || "",
        isMilestone: wbs.isMilestone,
      })
    } else {
      setFormData({
        wbsCode: "",
        wbsName: "",
        description: "",
        parentWbsId: "",
        assigneeDepartmentStableId: "",
        assigneeEmployeeId: "",
        startDate: "",
        dueDate: "",
        isMilestone: false,
      })
    }
    setErrors({})
  }, [wbs, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.wbsName.trim()) {
      newErrors.wbsName = "WBS名は必須です"
    } else if (formData.wbsName.length > 200) {
      newErrors.wbsName = "WBS名は200文字以内で入力してください"
    }

    if (formData.wbsCode && formData.wbsCode.length > 50) {
      newErrors.wbsCode = "WBSコードは50文字以内で入力してください"
    }

    if (formData.startDate && formData.dueDate && formData.startDate > formData.dueDate) {
      newErrors.dueDate = "終了日は開始日以降を指定してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      if (isEdit && wbs) {
        const request: BffUpdateWbsRequest = {
          wbsCode: formData.wbsCode || undefined,
          wbsName: formData.wbsName,
          description: formData.description || undefined,
          assigneeDepartmentStableId: formData.assigneeDepartmentStableId || undefined,
          assigneeEmployeeId: formData.assigneeEmployeeId || undefined,
          startDate: formData.startDate || undefined,
          dueDate: formData.dueDate || undefined,
          isMilestone: formData.isMilestone,
          updatedAt: wbs.updatedAt,
        }
        await onSave(request)
      } else {
        const request: BffCreateWbsRequest = {
          actionPlanId: planId,
          parentWbsId: formData.parentWbsId || undefined,
          wbsCode: formData.wbsCode || undefined,
          wbsName: formData.wbsName,
          description: formData.description || undefined,
          assigneeDepartmentStableId: formData.assigneeDepartmentStableId || undefined,
          assigneeEmployeeId: formData.assigneeEmployeeId || undefined,
          startDate: formData.startDate || undefined,
          dueDate: formData.dueDate || undefined,
          isMilestone: formData.isMilestone,
        }
        await onSave(request)
      }
      onClose()
    } catch (error) {
      console.error("[gantt] Failed to save WBS:", error)
    } finally {
      setLoading(false)
    }
  }

  const parentOptions = allWbsItems.filter((w) => w.id !== wbs?.id && !w.isMilestone)

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "WBS編集" : "WBS作成"}</SheetTitle>
          <SheetDescription>{isEdit ? "WBSの情報を編集します" : "新しいWBSを作成します"}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-1 py-4">
          <div>
            <Label htmlFor="wbsCode">WBSコード</Label>
            <Input
              id="wbsCode"
              value={formData.wbsCode}
              onChange={(e) => setFormData({ ...formData, wbsCode: e.target.value })}
              placeholder="空欄で自動採番"
            />
            {errors.wbsCode && <p className="text-sm text-destructive mt-1">{errors.wbsCode}</p>}
          </div>

          <div>
            <Label htmlFor="wbsName">
              WBS名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="wbsName"
              value={formData.wbsName}
              onChange={(e) => setFormData({ ...formData, wbsName: e.target.value })}
              placeholder="WBS名を入力"
            />
            {errors.wbsName && <p className="text-sm text-destructive mt-1">{errors.wbsName}</p>}
          </div>

          <div>
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="説明を入力（任意）"
              rows={3}
            />
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="parentWbsId">親WBS</Label>
              <Select
                value={formData.parentWbsId}
                onValueChange={(value) => setFormData({ ...formData, parentWbsId: value })}
              >
                <SelectTrigger id="parentWbsId">
                  <SelectValue placeholder="なし（ルート）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし（ルート）</SelectItem>
                  {parentOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.wbsCode} {w.wbsName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="assigneeDepartmentStableId">担当部門</Label>
            <Select
              value={formData.assigneeDepartmentStableId}
              onValueChange={(value) => setFormData({ ...formData, assigneeDepartmentStableId: value })}
            >
              <SelectTrigger id="assigneeDepartmentStableId">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                <SelectItem value="dept-planning">企画部</SelectItem>
                <SelectItem value="dept-sales">営業部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assigneeEmployeeId">担当者</Label>
            <Select
              value={formData.assigneeEmployeeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeEmployeeId: value })}
            >
              <SelectTrigger id="assigneeEmployeeId">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                <SelectItem value="emp-001">山田太郎</SelectItem>
                <SelectItem value="emp-002">佐藤花子</SelectItem>
                <SelectItem value="emp-003">鈴木一郎</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">開始日</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">終了日</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              {errors.dueDate && <p className="text-sm text-destructive mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMilestone"
              checked={formData.isMilestone}
              onCheckedChange={(checked) => setFormData({ ...formData, isMilestone: checked === true })}
            />
            <Label htmlFor="isMilestone" className="cursor-pointer">
              マイルストーン
            </Label>
          </div>
        </div>

        <SheetFooter className="gap-2">
          {isEdit && onDelete && (
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "保存" : "作成"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
