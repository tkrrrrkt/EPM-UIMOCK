"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"
import { Edit2, Plus, Trash2, X } from "lucide-react"
import { ColorPicker } from "./ColorPicker"
import { getErrorMessage } from "../lib/error-messages"
import { toast } from "sonner"
import type { BffTaskLabel, BffCreateLabelRequest, BffUpdateLabelRequest } from "../types"

interface LabelEditPopoverProps {
  planId: string
  labels: BffTaskLabel[]
  onCreateLabel: (request: BffCreateLabelRequest) => Promise<void>
  onUpdateLabel: (labelId: string, request: BffUpdateLabelRequest) => Promise<void>
  onDeleteLabel: (labelId: string) => Promise<void>
}

export function LabelEditPopover({
  labels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}: LabelEditPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6")
  const [deleteConfirm, setDeleteConfirm] = useState<BffTaskLabel | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStartEdit = (label: BffTaskLabel) => {
    setEditingLabelId(label.id)
    setEditingName(label.labelName)
  }

  const handleCancelEdit = () => {
    setEditingLabelId(null)
    setEditingName("")
  }

  const handleSaveEdit = async (label: BffTaskLabel) => {
    if (editingName.trim() === label.labelName) {
      handleCancelEdit()
      return
    }

    if (!editingName.trim()) {
      toast.error("ラベル名を入力してください")
      return
    }

    try {
      setIsSubmitting(true)
      await onUpdateLabel(label.id, {
        labelName: editingName.trim(),
        updatedAt: label.updatedAt,
      })
      toast.success("ラベルを更新しました")
      handleCancelEdit()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleColorChange = async (label: BffTaskLabel, newColor: string) => {
    try {
      setIsSubmitting(true)
      await onUpdateLabel(label.id, {
        colorCode: newColor,
        updatedAt: label.updatedAt,
      })
      toast.success("カラーを更新しました")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (label: BffTaskLabel) => {
    try {
      setIsSubmitting(true)
      await onDeleteLabel(label.id)
      toast.success("ラベルを削除しました")
      setDeleteConfirm(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreate = async () => {
    if (!newLabelName.trim()) {
      toast.error("ラベル名を入力してください")
      return
    }

    try {
      setIsSubmitting(true)
      await onCreateLabel({
        labelCode: newLabelName.trim().toUpperCase().replace(/\s+/g, "_"),
        labelName: newLabelName.trim(),
        colorCode: newLabelColor,
      })
      toast.success("ラベルを作成しました")
      setNewLabelName("")
      setNewLabelColor("#3B82F6")
      setIsCreating(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            ラベル編集
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">ラベル管理</h4>
              {!isCreating && (
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)} disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {labels.map((label) => (
                <div key={label.id} className="flex items-start gap-2 p-2 border rounded-md">
                  <div className="w-6 h-6 rounded shrink-0 mt-1" style={{ backgroundColor: label.colorCode }} />
                  <div className="flex-1 space-y-2">
                    {editingLabelId === label.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(label)
                            if (e.key === "Escape") handleCancelEdit()
                          }}
                          disabled={isSubmitting}
                          placeholder="ラベル名"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(label)} disabled={isSubmitting}>
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{label.labelName}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleStartEdit(label)}
                              disabled={isSubmitting}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => setDeleteConfirm(label)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {["#6B7280", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4"].map(
                            (color) => (
                              <button
                                key={color}
                                type="button"
                                className="h-6 rounded border hover:ring-2 ring-primary ring-offset-1 transition-all"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(label, color)}
                                disabled={isSubmitting}
                              >
                                <span className="sr-only">{color}</span>
                              </button>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isCreating && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">新規ラベル</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setIsCreating(false)
                      setNewLabelName("")
                      setNewLabelColor("#3B82F6")
                    }}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="ラベル名"
                    disabled={isSubmitting}
                  />
                  <ColorPicker value={newLabelColor} onChange={setNewLabelColor} />
                </div>
                <Button onClick={handleCreate} disabled={!newLabelName.trim() || isSubmitting} className="w-full">
                  作成
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ラベルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。ラベル「{deleteConfirm?.labelName}
              」が削除され、使用中のタスクからも解除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={isSubmitting}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
