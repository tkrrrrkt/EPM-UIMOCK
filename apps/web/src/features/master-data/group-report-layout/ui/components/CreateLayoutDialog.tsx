"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { Input } from "@/shared/ui"
import { Textarea } from "@/shared/ui"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui"
import { Alert, AlertDescription } from "@/shared/ui"
import type { LayoutType } from "@epm/contracts/bff/group-report-layout"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../lib/error-messages"

interface CreateLayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateLayoutDialog({ open, onOpenChange, onSuccess }: CreateLayoutDialogProps) {
  const [layoutCode, setLayoutCode] = useState("")
  const [layoutName, setLayoutName] = useState("")
  const [layoutNameShort, setLayoutNameShort] = useState("")
  const [layoutType, setLayoutType] = useState<LayoutType>("PL")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!layoutCode || !layoutName) {
      setError("必須項目を入力してください")
      return
    }

    setIsSubmitting(true)
    try {
      await bffClient.createLayout({
        layoutCode,
        layoutName,
        layoutType,
        layoutNameShort: layoutNameShort || undefined,
        description: description || undefined,
      })
      resetForm()
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setLayoutCode("")
    setLayoutName("")
    setLayoutNameShort("")
    setLayoutType("PL")
    setDescription("")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>連結レイアウト新規作成</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                レイアウトコード <span className="text-destructive">*</span>
              </label>
              <Input
                value={layoutCode}
                onChange={(e) => setLayoutCode(e.target.value)}
                placeholder="例: C_PL_STD"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                レイアウト名 <span className="text-destructive">*</span>
              </label>
              <Input
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="例: 連結損益計算書（標準）"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">レイアウト名（短縮）</label>
              <Input
                value={layoutNameShort}
                onChange={(e) => setLayoutNameShort(e.target.value)}
                placeholder="例: 連結PL標準"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                レイアウト種別 <span className="text-destructive">*</span>
              </label>
              <Select value={layoutType} onValueChange={(v) => setLayoutType(v as LayoutType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PL">連結損益計算書</SelectItem>
                  <SelectItem value="BS">連結貸借対照表</SelectItem>
                  <SelectItem value="KPI">連結KPI指標</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">説明</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="レイアウトの説明を入力..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
