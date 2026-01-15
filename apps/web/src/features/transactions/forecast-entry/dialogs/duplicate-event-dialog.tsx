"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  useToast,
} from "@/shared/ui"
import { MockForecastBffClient } from "../api/MockBffClient"
import type { BffForecastEventSummary } from "@epm/contracts/bff/forecast-entry"

const bffClient = new MockForecastBffClient()

interface DuplicateForecastEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: BffForecastEventSummary
  onSuccess: () => void
}

export function DuplicateForecastEventDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: DuplicateForecastEventDialogProps) {
  const [newEventCode, setNewEventCode] = useState("")
  const [newEventName, setNewEventName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit() {
    if (!newEventCode || !newEventName) {
      toast({
        title: "エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.duplicateEvent(event.id, newEventCode, newEventName)
      toast({
        title: "複製完了",
        description: "見込イベントを複製しました",
      })
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "FORECAST_EVENT_CODE_DUPLICATE"
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

  function resetForm() {
    setNewEventCode("")
    setNewEventName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>見込イベントを複製</DialogTitle>
          <DialogDescription>
            「{event.eventName}」を複製します。新しいイベント情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-event-code">新しいイベントコード</Label>
            <Input
              id="new-event-code"
              value={newEventCode}
              onChange={(e) => setNewEventCode(e.target.value)}
              placeholder={`例: ${event.eventCode}-copy`}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-event-name">新しいイベント名</Label>
            <Input
              id="new-event-name"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder={`例: ${event.eventName} (コピー)`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "複製中..." : "複製"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
