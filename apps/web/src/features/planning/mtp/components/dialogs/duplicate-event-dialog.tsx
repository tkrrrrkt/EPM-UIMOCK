"use client"

import type React from "react"

import { useState } from "react"
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
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../../api/mock-bff-client"
import type { BffMtpEventSummary } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface DuplicateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: BffMtpEventSummary
  onSuccess: () => void
}

export function DuplicateEventDialog({ open, onOpenChange, event, onSuccess }: DuplicateEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [newEventCode, setNewEventCode] = useState(`${event.eventCode}_COPY`)
  const [newEventName, setNewEventName] = useState(`${event.eventName}（コピー）`)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!newEventCode || !newEventName) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.duplicateEvent(event.id, {
        newEventCode,
        newEventName,
      })

      toast({
        title: "複製完了",
        description: "イベントを複製しました",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "MTP_EVENT_CODE_DUPLICATE"
          ? "イベントコードが重複しています"
          : "イベントの複製に失敗しました"
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>イベントを複製</DialogTitle>
          <DialogDescription>新しいイベントコードと名前を入力してください</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEventCode">
                新イベントコード<span className="text-destructive">*</span>
              </Label>
              <Input
                id="newEventCode"
                value={newEventCode}
                onChange={(e) => setNewEventCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEventName">
                新イベント名<span className="text-destructive">*</span>
              </Label>
              <Input
                id="newEventName"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "複製中..." : "複製"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
