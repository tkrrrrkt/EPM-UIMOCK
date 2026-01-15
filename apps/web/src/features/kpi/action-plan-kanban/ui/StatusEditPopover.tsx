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
import { MoreHorizontal, Trash2 } from "lucide-react"
import { ColorPicker } from "./ColorPicker"
import { getErrorMessage } from "../lib/error-messages"
import { toast } from "sonner"
import type { BffTaskStatus } from "../types"

interface StatusEditPopoverProps {
  status: BffTaskStatus
  onUpdate: (statusId: string, updates: { statusName?: string; colorCode?: string; updatedAt: string }) => Promise<void>
  onDelete: (statusId: string) => Promise<void>
  hasRelatedTasks: boolean
}

export function StatusEditPopover({ status, onUpdate, onDelete, hasRelatedTasks }: StatusEditPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [statusName, setStatusName] = useState(status.statusName)
  const [colorCode, setColorCode] = useState(status.colorCode || "#6B7280")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameBlur = async () => {
    if (statusName !== status.statusName && statusName.trim()) {
      try {
        setIsSubmitting(true)
        await onUpdate(status.id, { statusName: statusName.trim(), updatedAt: status.updatedAt })
        toast.success("ステータス名を更新しました")
      } catch (error) {
        toast.error(getErrorMessage(error))
        setStatusName(status.statusName)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleColorChange = async (newColor: string) => {
    if (newColor !== colorCode) {
      try {
        setColorCode(newColor)
        setIsSubmitting(true)
        await onUpdate(status.id, { colorCode: newColor, updatedAt: status.updatedAt })
        toast.success("カラーを更新しました")
      } catch (error) {
        toast.error(getErrorMessage(error))
        setColorCode(status.colorCode || "#6B7280")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      await onDelete(status.id)
      toast.success("ステータスを削除しました")
      setShowDeleteDialog(false)
      setIsOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const canDelete = !status.isDefault && !hasRelatedTasks

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">ステータス編集</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-name">ステータス名</Label>
              <Input
                id="status-name"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                onBlur={handleNameBlur}
                disabled={isSubmitting}
                placeholder="ステータス名を入力"
              />
            </div>

            <div className="space-y-2">
              <Label>カラー</Label>
              <ColorPicker value={colorCode} onChange={handleColorChange} />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={!canDelete || isSubmitting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </div>

            {!canDelete && (
              <p className="text-xs text-muted-foreground">
                {status.isDefault
                  ? "デフォルトステータスは削除できません"
                  : "タスクが存在するステータスは削除できません"}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ステータスを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。ステータス「{status.statusName}」が削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
