"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import type { PeriodType } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateEventDialog({ open, onOpenChange, onCreated }: CreateEventDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [eventCode, setEventCode] = useState("")
  const [eventName, setEventName] = useState("")
  const [fiscalYear, setFiscalYear] = useState("2026")
  const [periodType, setPeriodType] = useState<PeriodType>("ANNUAL")
  const [periodNo, setPeriodNo] = useState("1")
  const [dimensionId, setDimensionId] = useState("")
  const [layoutId, setLayoutId] = useState("")
  const [description, setDescription] = useState("")

  const [dimensions, setDimensions] = useState<Array<{ id: string; dimensionName: string }>>([])
  const [layouts, setLayouts] = useState<Array<{ id: string; layoutName: string }>>([])

  useEffect(() => {
    if (open) {
      loadMasterData()
    }
  }, [open])

  const loadMasterData = async () => {
    try {
      const [dims, lays] = await Promise.all([bffClient.getDimensions(), bffClient.getLayouts("GUIDELINE")])
      setDimensions(dims)
      setLayouts(lays)
      if (dims.length > 0) setDimensionId(dims[0].id)
      if (lays.length > 0) setLayoutId(lays[0].id)
    } catch (error) {
      console.error("Failed to load master data:", error)
    }
  }

  const getPeriodOptions = () => {
    switch (periodType) {
      case "ANNUAL":
        return [{ value: "1", label: "1" }]
      case "HALF":
        return [
          { value: "1", label: "1 (上期)" },
          { value: "2", label: "2 (下期)" },
        ]
      case "QUARTER":
        return [
          { value: "1", label: "1 (Q1)" },
          { value: "2", label: "2 (Q2)" },
          { value: "3", label: "3 (Q3)" },
          { value: "4", label: "4 (Q4)" },
        ]
      default:
        return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventCode || !eventName || !dimensionId || !layoutId) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "必須項目を入力してください",
      })
      return
    }

    setLoading(true)
    try {
      await bffClient.createEvent({
        eventCode,
        eventName,
        fiscalYear: Number(fiscalYear),
        periodType,
        periodNo: Number(periodNo),
        dimensionId,
        layoutId,
        description: description || undefined,
      })

      toast({
        title: "成功",
        description: "ガイドラインイベントを作成しました",
      })
      onCreated()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create event:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "作成に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEventCode("")
    setEventName("")
    setFiscalYear("2026")
    setPeriodType("ANNUAL")
    setPeriodNo("1")
    setDescription("")
  }

  useEffect(() => {
    setPeriodNo("1")
  }, [periodType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新規ガイドラインイベント作成</DialogTitle>
          <DialogDescription>予算ガイドラインの新しいイベントを作成します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventCode">
                イベントコード<span className="text-destructive">*</span>
              </Label>
              <Input
                id="eventCode"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="FY2026_GL_ANNUAL"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">
                イベント名<span className="text-destructive">*</span>
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="FY2026 年度ガイドライン"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">
                対象年度<span className="text-destructive">*</span>
              </Label>
              <Select value={fiscalYear} onValueChange={setFiscalYear}>
                <SelectTrigger id="fiscalYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodType">
                期間種別<span className="text-destructive">*</span>
              </Label>
              <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                <SelectTrigger id="periodType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">年度</SelectItem>
                  <SelectItem value="HALF">半期</SelectItem>
                  <SelectItem value="QUARTER">四半期</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodNo">
                期番号<span className="text-destructive">*</span>
              </Label>
              <Select value={periodNo} onValueChange={setPeriodNo}>
                <SelectTrigger id="periodNo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getPeriodOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimensionId">
                組織ディメンション<span className="text-destructive">*</span>
              </Label>
              <Select value={dimensionId} onValueChange={setDimensionId}>
                <SelectTrigger id="dimensionId">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.map((dim) => (
                    <SelectItem key={dim.id} value={dim.id}>
                      {dim.dimensionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="layoutId">
                レイアウト<span className="text-destructive">*</span>
              </Label>
              <Select value={layoutId} onValueChange={setLayoutId}>
                <SelectTrigger id="layoutId">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {layouts.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.layoutName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="イベントの説明を入力してください"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
