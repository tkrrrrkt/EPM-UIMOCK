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
  Alert,
  AlertDescription,
} from '@/shared/ui'
import { Info } from 'lucide-react'
import type { BffCopyVersionRequest, BffVersionSummary } from '@epm/contracts/bff/organization-master'

interface CopyVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceVersion: BffVersionSummary | null
  onSubmit: (id: string, data: BffCopyVersionRequest) => Promise<void>
}

export function CopyVersionDialog({ open, onOpenChange, sourceVersion, onSubmit }: CopyVersionDialogProps) {
  const [formData, setFormData] = useState<BffCopyVersionRequest>({
    versionCode: '',
    versionName: '',
    effectiveDate: '',
    expiryDate: undefined,
    description: undefined,
  })

  useEffect(() => {
    if (sourceVersion) {
      setFormData({
        versionCode: '',
        versionName: `${sourceVersion.versionName}（コピー）`,
        effectiveDate: '',
        expiryDate: undefined,
        description: undefined,
      })
    }
  }, [sourceVersion])

  const handleSubmit = async () => {
    if (!sourceVersion) return
    await onSubmit(sourceVersion.id, formData)
    onOpenChange(false)
  }

  if (!sourceVersion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>バージョンをコピー</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              コピー元: <strong>{sourceVersion.versionName}</strong>
              <br />
              全ての部門データもコピーされます
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="versionCode">バージョンコード *</Label>
            <Input
              id="versionCode"
              placeholder="例: 2026-04"
              value={formData.versionCode}
              onChange={(e) => setFormData({ ...formData, versionCode: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="versionName">バージョン名 *</Label>
            <Input
              id="versionName"
              placeholder="例: 2026年4月組織改編"
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
          <Button onClick={handleSubmit}>コピー作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
