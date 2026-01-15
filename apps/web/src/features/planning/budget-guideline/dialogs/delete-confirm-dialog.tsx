"use client"

import { useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useToast,
} from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import { MockBffClient } from "../api/mock-bff-client"
import type { BffGuidelineEventSummary } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: BffGuidelineEventSummary
  onDeleted: () => void
}

export function DeleteConfirmDialog({ open, onOpenChange, event, onDeleted }: DeleteConfirmDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await bffClient.deleteEvent(event.id)
      toast({
        title: "成功",
        description: "ガイドラインイベントを削除しました",
      })
      onDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "削除に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            ガイドラインイベントの削除
          </DialogTitle>
          <DialogDescription>この操作は取り消せません</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            「<span className="font-semibold">{event.eventName}</span>」を削除しますか？
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "削除中..." : "削除する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
