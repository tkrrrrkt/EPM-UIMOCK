'use client'

import { useState } from 'react'
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
  Alert,
  AlertDescription,
} from '@/shared/ui'
import { getErrorMessage } from '../constants'
import { bffClient } from '../api'

interface CopyEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceEventId: string | null
  sourceEventName: string
  onSuccess: () => void
}

export function CopyEventDialog({
  open,
  onOpenChange,
  sourceEventId,
  sourceEventName,
  onSuccess,
}: CopyEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newEventCode, setNewEventCode] = useState('')
  const [newEventName, setNewEventName] = useState('')

  const handleSubmit = async () => {
    if (!sourceEventId) return

    setError(null)

    if (!newEventCode.trim()) {
      setError('新しいイベントコードを入力してください')
      return
    }
    if (!newEventName.trim()) {
      setError('新しいイベント名を入力してください')
      return
    }

    setLoading(true)
    try {
      await bffClient.copyEvent(sourceEventId, {
        newEventCode: newEventCode.trim(),
        newEventName: newEventName.trim(),
      })
      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewEventCode('')
    setNewEventName('')
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>配賦イベントのコピー</DialogTitle>
          <DialogDescription>
            「{sourceEventName}」を複製して新しいイベントを作成します。
            ステップとターゲットも一緒にコピーされます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="newEventCode">
              新しいイベントコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEventCode"
              value={newEventCode}
              onChange={(e) => setNewEventCode(e.target.value)}
              placeholder="例: ALLOC-001-COPY"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEventName">
              新しいイベント名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newEventName"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="例: 本社経費配賦(実績) - コピー"
              maxLength={200}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'コピー中...' : 'コピー'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
