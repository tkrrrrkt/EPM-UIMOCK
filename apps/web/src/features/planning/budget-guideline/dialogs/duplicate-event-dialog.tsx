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
import { MockBffClient } from "../api/mock-bff-client"
import type { BffGuidelineEventSummary } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

interface DuplicateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceEvent: BffGuidelineEventSummary
  onDuplicated: () => void
}

export function DuplicateEventDialog({ open, onOpenChange, sourceEvent, onDuplicated }: DuplicateEventDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newEventCode, setNewEventCode] = useState("")
  const [newEventName, setNewEventName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEventCode || !newEventName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "必須項目を入力してください",
      })
      return
    }

    setLoading(true)
    try {
      await bffClient.duplicateEvent(sourceEvent.id, {
        newEventCode,
        newEventName,
      })

      toast({
        title: "成功",
        description: "ガイドラインイベントを複製しました",
      })
      onDuplicated()
      onOpenChange(false)
      setNewEventCode("")
      setNewEventName("")
    } catch (error) {
      console.error("Failed to duplicate event:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "複製に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ガイドラインイベントの複製</DialogTitle>
          <DialogDescription>「{sourceEvent.eventName}」を複製します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEventCode">
              新しいイベントコード<span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEventCode"
              value={newEventCode}
              onChange={(e) => setNewEventCode(e.target.value)}
              placeholder={`${sourceEvent.eventCode}_COPY`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEventName">
              新しいイベント名<span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEventName"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder={`${sourceEvent.eventName} (コピー)`}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
