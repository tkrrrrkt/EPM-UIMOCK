"use client"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { AlertCircle } from "lucide-react"

interface ConfirmStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmStatusDialog({ open, onOpenChange, onConfirm }: ConfirmStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ステータスを確定</DialogTitle>
          <DialogDescription>イベントのステータスを「確定」に変更しますか？</DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>変更後は数値・テーマの編集ができなくなります。</AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>変更する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
