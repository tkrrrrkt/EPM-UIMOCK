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
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../../api/mock-bff-client"
import type { BffDimensionValueSummary, BffStrategyThemeSummary } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface EditThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  theme: BffStrategyThemeSummary
  dimensionValues: BffDimensionValueSummary[]
  onSuccess: () => void
}

export function EditThemeDialog({
  open,
  onOpenChange,
  eventId,
  theme,
  dimensionValues,
  onSuccess,
}: EditThemeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    themeName: theme.themeName,
    strategyCategory: theme.strategyCategory || "",
    description: "",
    targetDate: theme.targetDate || "",
  })
  const { toast } = useToast()

  useEffect(() => {
    setFormData({
      themeName: theme.themeName,
      strategyCategory: theme.strategyCategory || "",
      description: "",
      targetDate: theme.targetDate || "",
    })
  }, [theme])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.themeName) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.updateTheme(eventId, theme.id, {
        themeName: formData.themeName,
        strategyCategory: formData.strategyCategory || undefined,
        description: formData.description || undefined,
        targetDate: formData.targetDate || undefined,
      })

      toast({
        title: "更新完了",
        description: "戦略テーマを更新しました",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "エラー",
        description: "戦略テーマの更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>戦略テーマ編集</DialogTitle>
          <DialogDescription>コード: {theme.themeCode}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="themeName">
                テーマ名<span className="text-destructive">*</span>
              </Label>
              <Input
                id="themeName"
                value={formData.themeName}
                onChange={(e) => setFormData({ ...formData, themeName: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="strategyCategory">戦略種別</Label>
                <Input
                  id="strategyCategory"
                  value={formData.strategyCategory}
                  onChange={(e) => setFormData({ ...formData, strategyCategory: e.target.value })}
                  placeholder="成長戦略"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">期限</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">概要</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="テーマの概要や目的を入力"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
