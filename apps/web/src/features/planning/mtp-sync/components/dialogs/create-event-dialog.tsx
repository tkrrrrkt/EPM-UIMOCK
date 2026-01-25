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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../../api/mock-bff-client"
import type { PlanYears } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventCode: "",
    eventName: "",
    planYears: "3" as string,
    startFiscalYear: "2026",
    dimensionId: "dim-001",
    layoutId: "layout-001",
    description: "",
  })
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.eventCode || !formData.eventName) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.createEvent({
        eventCode: formData.eventCode,
        eventName: formData.eventName,
        planYears: Number.parseInt(formData.planYears) as PlanYears,
        startFiscalYear: Number.parseInt(formData.startFiscalYear),
        dimensionId: formData.dimensionId,
        layoutId: formData.layoutId,
        description: formData.description || undefined,
      })

      toast({
        title: "作成完了",
        description: "イベントを作成しました",
      })

      onOpenChange(false)
      onSuccess()
      setFormData({
        eventCode: "",
        eventName: "",
        planYears: "3",
        startFiscalYear: "2026",
        dimensionId: "dim-001",
        layoutId: "layout-001",
        description: "",
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "MTP_EVENT_CODE_DUPLICATE"
          ? "イベントコードが重複しています"
          : "イベントの作成に失敗しました"
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新規イベント作成</DialogTitle>
          <DialogDescription>中期経営計画イベントの基本情報を入力してください</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventCode">
                  イベントコード<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="eventCode"
                  value={formData.eventCode}
                  onChange={(e) => setFormData({ ...formData, eventCode: e.target.value })}
                  placeholder="MTP2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName">
                  イベント名<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="eventName"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="2026年中期経営計画"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planYears">
                  計画年数<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.planYears}
                  onValueChange={(value) => setFormData({ ...formData, planYears: value })}
                >
                  <SelectTrigger id="planYears">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3年</SelectItem>
                    <SelectItem value="5">5年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startFiscalYear">
                  開始年度<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.startFiscalYear}
                  onValueChange={(value) => setFormData({ ...formData, startFiscalYear: value })}
                >
                  <SelectTrigger id="startFiscalYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => 2024 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        FY{year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dimensionId">
                  組織ディメンション<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.dimensionId}
                  onValueChange={(value) => setFormData({ ...formData, dimensionId: value })}
                >
                  <SelectTrigger id="dimensionId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dim-001">事業部</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="layoutId">
                  レイアウト<span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.layoutId}
                  onValueChange={(value) => setFormData({ ...formData, layoutId: value })}
                >
                  <SelectTrigger id="layoutId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="layout-001">標準PL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="計画の概要や目的を入力"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
