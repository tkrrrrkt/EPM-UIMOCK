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
import { MockBffClient } from "../../../api/mock-bff-client"
import type { BffDimensionValueSummary, BffStrategyThemeSummary } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface CreateThemeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  dimensionValues: BffDimensionValueSummary[]
  themes: BffStrategyThemeSummary[]
  onSuccess: () => void
}

export function CreateThemeDialog({
  open,
  onOpenChange,
  eventId,
  dimensionValues,
  themes,
  onSuccess,
}: CreateThemeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    themeCode: "",
    themeName: "",
    parentThemeId: "none",
    dimensionValueId: "",
    strategyCategory: "",
    description: "",
    targetDate: "",
  })
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.themeCode || !formData.themeName) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.createTheme(eventId, {
        themeCode: formData.themeCode,
        themeName: formData.themeName,
        parentThemeId: formData.parentThemeId === "none" ? undefined : formData.parentThemeId,
        dimensionValueId: formData.dimensionValueId || undefined,
        strategyCategory: formData.strategyCategory || undefined,
        description: formData.description || undefined,
        targetDate: formData.targetDate || undefined,
      })

      toast({
        title: "作成完了",
        description: "戦略テーマを作成しました",
      })

      onOpenChange(false)
      onSuccess()
      setFormData({
        themeCode: "",
        themeName: "",
        parentThemeId: "none",
        dimensionValueId: "",
        strategyCategory: "",
        description: "",
        targetDate: "",
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "MTP_THEME_CODE_DUPLICATE"
          ? "テーマコードが重複しています"
          : "戦略テーマの作成に失敗しました"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規戦略テーマ作成</DialogTitle>
          <DialogDescription>戦略テーマの基本情報を入力してください</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="themeCode">
                  テーマコード<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="themeCode"
                  value={formData.themeCode}
                  onChange={(e) => setFormData({ ...formData, themeCode: e.target.value })}
                  placeholder="STR001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="themeName">
                  テーマ名<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="themeName"
                  value={formData.themeName}
                  onChange={(e) => setFormData({ ...formData, themeName: e.target.value })}
                  placeholder="デジタル変革推進"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parentThemeId">親テーマ</Label>
                <Select
                  value={formData.parentThemeId}
                  onValueChange={(value) => setFormData({ ...formData, parentThemeId: value })}
                >
                  <SelectTrigger id="parentThemeId">
                    <SelectValue placeholder="なし（全社テーマ）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし（全社テーマ）</SelectItem>
                    {themes
                      .filter((t) => !t.parentThemeId)
                      .map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.themeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensionValueId">対象ディメンション値</Label>
                <Select
                  value={formData.dimensionValueId}
                  onValueChange={(value) => setFormData({ ...formData, dimensionValueId: value })}
                  disabled={!formData.parentThemeId || formData.parentThemeId === "none"}
                >
                  <SelectTrigger id="dimensionValueId">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensionValues
                      .filter((dv) => dv.valueCode !== "ALL")
                      .map((dv) => (
                        <SelectItem key={dv.id} value={dv.id}>
                          {dv.valueName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
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
              {loading ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
