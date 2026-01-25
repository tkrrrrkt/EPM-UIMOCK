"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import type { ScenarioType } from "@epm/contracts/bff/budget-entry"

const bffClient = new MockBffClient()

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [eventCode, setEventCode] = useState("")
  const [eventName, setEventName] = useState("")
  const [scenarioType, setScenarioType] = useState<ScenarioType>("BUDGET")
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear())
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // 年度の選択肢を生成（現在の年度から前後3年）
  const currentYear = new Date().getFullYear()
  const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).reverse()

  async function handleSubmit() {
    if (!eventCode.trim() || !eventName.trim()) {
      toast({
        title: "入力エラー",
        description: "イベントコードとイベント名は必須です",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await bffClient.createEvent({
        eventCode: eventCode.trim(),
        eventName: eventName.trim(),
        scenarioType,
        fiscalYear,
        layoutId: "layout-001", // デフォルトレイアウト
      })
      toast({
        title: "作成完了",
        description: "新しいイベントを作成しました",
      })
      onSuccess()
      handleClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "BUDGET_EVENT_CODE_DUPLICATE"
          ? "このイベントコードは既に使用されています"
          : "イベントの作成に失敗しました"
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
    setEventCode("")
    setEventName("")
    setScenarioType("BUDGET")
    setFiscalYear(currentYear)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新規イベント作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="eventCode">イベントコード</Label>
            <Input
              id="eventCode"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="FY2026_BUDGET_INIT"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventName">イベント名</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="FY2026 当初予算"
            />
          </div>
          <div className="space-y-2">
            <Label>シナリオ</Label>
            <Select value={scenarioType} onValueChange={(value) => setScenarioType(value as ScenarioType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUDGET">予算</SelectItem>
                <SelectItem value="FORECAST">見込</SelectItem>
                <SelectItem value="ACTUAL">実績</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>年度</Label>
            <Select value={String(fiscalYear)} onValueChange={(value) => setFiscalYear(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    FY{year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "作成中..." : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
