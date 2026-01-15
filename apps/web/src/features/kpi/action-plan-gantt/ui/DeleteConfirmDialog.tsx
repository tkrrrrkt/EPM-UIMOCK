"use client"

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
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { AlertTriangle } from "lucide-react"
import type { BffGanttWbs } from "../types"

interface DeleteConfirmDialogProps {
  open: boolean
  wbs: BffGanttWbs | null
  childrenCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ open, wbs, childrenCount, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!wbs) return null

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>WBSを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>「{wbs.wbsName}」を削除します。この操作は取り消せません。</AlertDialogDescription>
        </AlertDialogHeader>

        {(childrenCount > 0 || wbs.taskCount > 0) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              配下のWBS {childrenCount}件、タスク {wbs.taskCount}件も削除されます。
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
