"use client"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import type { GuidelineEventStatus } from "@epm/contracts/bff/budget-guideline"

interface ConfirmStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: GuidelineEventStatus
  targetStatus: GuidelineEventStatus | null
  onConfirm: () => void
}

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  targetStatus,
  onConfirm,
}: ConfirmStatusDialogProps) {
  const getDialogContent = () => {
    if (targetStatus === "CONFIRMED") {
      return {
        title: "ステータスを確定に変更",
        description: "ステータスを確定に変更しますか？変更後は数値の編集ができなくなります。",
        confirmLabel: "確定にする",
      }
    } else {
      return {
        title: "ステータスを下書きに戻す",
        description: "ステータスを下書きに戻しますか？編集が可能になります。",
        confirmLabel: "下書きに戻す",
      }
    }
  }

  const content = getDialogContent()

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>{content.confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
