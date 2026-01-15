"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui"
import { Button } from "@/shared/ui"
import { Input } from "@/shared/ui"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui"
import { Alert, AlertDescription } from "@/shared/ui"
import type { LayoutType } from "@epm/contracts/bff/report-layout"
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
  const [layoutType, setLayoutType] = useState<LayoutType>("PL")
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
      await bffClient.createLayout({ layoutCode, layoutName, layoutType })
      setLayoutCode("")
      setLayoutName("")
      setLayoutType("PL")
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レイアウト新規作成</DialogTitle>
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
                placeholder="例: PL_STD"
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
                placeholder="例: 標準PL"
                required
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
                  <SelectItem value="PL">損益計算書</SelectItem>
                  <SelectItem value="BS">貸借対照表</SelectItem>
                  <SelectItem value="KPI">KPI指標</SelectItem>
                </SelectContent>
              </Select>
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
