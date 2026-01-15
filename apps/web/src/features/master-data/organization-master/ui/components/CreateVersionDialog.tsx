'use client'

import { useState } from 'react'
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
import type { BffCreateVersionRequest } from '@epm/contracts/bff/organization-master'

interface CreateVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BffCreateVersionRequest) => Promise<void>
}

export function CreateVersionDialog({ open, onOpenChange, onSubmit }: CreateVersionDialogProps) {
  const [formData, setFormData] = useState<BffCreateVersionRequest>({
    versionCode: '',
    versionName: '',
    effectiveDate: '',
    expiryDate: undefined,
    description: undefined,
  })

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData({
      versionCode: '',
      versionName: '',
      effectiveDate: '',
      expiryDate: undefined,
      description: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規バージョン作成</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="versionCode">バージョンコード *</Label>
            <Input
              id="versionCode"
              placeholder="例: 2025-04"
              value={formData.versionCode}
              onChange={(e) => setFormData({ ...formData, versionCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="versionName">バージョン名 *</Label>
            <Input
              id="versionName"
              placeholder="例: 2025年4月組織改編"
              value={formData.versionName}
              onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">有効開始日 *</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
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
            <p className="text-xs text-muted-foreground">未設定の場合は無期限となります</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="バージョンの説明を入力"
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
          <Button onClick={handleSubmit}>作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
