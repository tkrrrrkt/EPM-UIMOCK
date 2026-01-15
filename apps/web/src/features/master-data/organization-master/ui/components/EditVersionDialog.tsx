'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
} from '@/shared/ui'
import type { BffUpdateVersionRequest, BffVersionDetailResponse } from '@epm/contracts/bff/organization-master'

interface EditVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: BffVersionDetailResponse | null
  onSubmit: (id: string, data: BffUpdateVersionRequest) => Promise<void>
}

export function EditVersionDialog({ open, onOpenChange, version, onSubmit }: EditVersionDialogProps) {
  const [formData, setFormData] = useState<BffUpdateVersionRequest>({})

  useEffect(() => {
    if (version) {
      setFormData({
        versionCode: version.versionCode,
        versionName: version.versionName,
        effectiveDate: version.effectiveDate,
        expiryDate: version.expiryDate || undefined,
        description: version.description || undefined,
      })
    }
  }, [version])

  const handleSubmit = async () => {
    if (!version) return
    await onSubmit(version.id, formData)
    onOpenChange(false)
  }

  if (!version) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>バージョン編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="versionCode">バージョンコード *</Label>
            <Input
              id="versionCode"
              value={formData.versionCode || ''}
              onChange={(e) => setFormData({ ...formData, versionCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="versionName">バージョン名 *</Label>
            <Input
              id="versionName"
              value={formData.versionName || ''}
              onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">有効開始日 *</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate || ''}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">有効終了日</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
