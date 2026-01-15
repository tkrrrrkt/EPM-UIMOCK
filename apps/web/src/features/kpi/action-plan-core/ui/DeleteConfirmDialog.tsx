"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"
import { Button } from "@/shared/ui/components/button"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { BffActionPlanDetail } from "../types"

interface DeleteConfirmDialogProps {
  open: boolean
  plan: BffActionPlanDetail | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteConfirmDialog({ open, plan, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string>("")

  const handleConfirm = async () => {
    if (!plan) return

    setIsDeleting(true)
    setError("")

    try {
      await onConfirm(plan.id)
      onClose()
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "FORBIDDEN") {
          setError("この操作を行う権限がありません")
        } else {
          setError("削除に失敗しました")
        }
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (!plan) return null

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            アクションプランを削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="font-semibold text-foreground">{plan.planName}</p>
              <p className="text-sm text-muted-foreground">プランコード: {plan.planCode}</p>
            </div>

            <Alert variant="destructive" className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>警告:</strong> 配下のWBSとタスクも削除されます。
                <div className="mt-2 space-y-1 text-sm">
                  <div>• WBS: {plan.wbsCount}件</div>
                  <div>• タスク: {plan.taskCount}件</div>
                </div>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">この操作は取り消せません。本当に削除しますか？</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            削除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
