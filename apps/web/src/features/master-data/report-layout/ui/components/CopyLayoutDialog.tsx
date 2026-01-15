"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../lib/error-messages"

interface CopyLayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
  originalLayoutCode: string
  originalLayoutName: string
  onSuccess: (newLayoutId: string) => void
}

export function CopyLayoutDialog({
  open,
  onOpenChange,
  layoutId,
  originalLayoutCode,
  originalLayoutName,
  onSuccess,
}: CopyLayoutDialogProps) {
  const [layoutCode, setLayoutCode] = useState("")
  const [layoutName, setLayoutName] = useState("")
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
      const newLayout = await bffClient.copyLayout(layoutId, {
        layoutCode,
        layoutName,
      })
      resetForm()
      onSuccess(newLayout.id)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setLayoutCode("")
    setLayoutName("")
    setError(null)
  }

  // Initialize with suggested values when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLayoutCode(`${originalLayoutCode}_COPY`)
      setLayoutName(`${originalLayoutName}（コピー）`)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レイアウト複製</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              「{originalLayoutName}」を複製します。すべての行設定がコピーされます。
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">
                新しいレイアウトコード <span className="text-destructive">*</span>
              </label>
              <Input
                value={layoutCode}
                onChange={(e) => setLayoutCode(e.target.value)}
                placeholder="例: PL_STD_COPY"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                新しいレイアウト名 <span className="text-destructive">*</span>
              </label>
              <Input
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="例: 損益計算書（標準）コピー"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "複製中..." : "複製"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
