"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import type { BffPlanEventSummary } from "@epm/contracts/bff/budget-entry"

const bffClient = new MockBffClient()

interface DuplicateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: BffPlanEventSummary
  onSuccess: () => void
}

export function DuplicateEventDialog({ open, onOpenChange, event, onSuccess }: DuplicateEventDialogProps) {
  const [newEventCode, setNewEventCode] = useState("")
  const [newEventName, setNewEventName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && event) {
      setNewEventCode(`${event.eventCode}_COPY`)
      setNewEventName(`${event.eventName}（コピー）`)
    }
  }, [open, event])

  async function handleSubmit() {
    if (!newEventCode.trim() || !newEventName.trim()) {
      toast({
        title: "入力エラー",
        description: "イベントコードとイベント名は必須です",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await bffClient.duplicateEvent(event.id, {
        newEventCode: newEventCode.trim(),
        newEventName: newEventName.trim(),
      })
      toast({
        title: "複製完了",
        description: "イベントを複製しました",
      })
      onSuccess()
      handleClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "BUDGET_EVENT_CODE_DUPLICATE"
          ? "このイベントコードは既に使用されています"
          : "イベントの複製に失敗しました"
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setNewEventCode("")
    setNewEventName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>イベントを複製</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">複製元: {event.eventName}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEventCode">新しいイベントコード</Label>
            <Input
              id="newEventCode"
              value={newEventCode}
              onChange={(e) => setNewEventCode(e.target.value)}
              placeholder="FY2026_BUDGET_REV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEventName">新しいイベント名</Label>
            <Input
              id="newEventName"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="FY2026 修正予算"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "複製中..." : "複製"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
