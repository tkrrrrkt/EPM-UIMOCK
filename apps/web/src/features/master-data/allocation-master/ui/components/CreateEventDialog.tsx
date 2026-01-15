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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Alert,
  AlertDescription,
} from '@/shared/ui'
import type { ScenarioType, BffCreateAllocationEventRequest } from '@epm/contracts/bff/allocation-master'
import { SCENARIO_TYPE_LABELS, getErrorMessage } from '../constants'
import { bffClient } from '../api'

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [eventCode, setEventCode] = useState('')
  const [eventName, setEventName] = useState('')
  const [scenarioType, setScenarioType] = useState<ScenarioType>('ACTUAL')
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    setError(null)

    if (!eventCode.trim()) {
      setError('イベントコードを入力してください')
      return
    }
    if (!eventName.trim()) {
      setError('イベント名を入力してください')
      return
    }

    setLoading(true)
    try {
      const request: BffCreateAllocationEventRequest = {
        companyId: 'company-001', // TODO: 実際のcompanyIdを取得
        eventCode: eventCode.trim(),
        eventName: eventName.trim(),
        scenarioType,
        isActive: true,
        notes: notes.trim() || undefined,
      }
      await bffClient.createEvent(request)
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
    setEventCode('')
    setEventName('')
    setScenarioType('ACTUAL')
    setNotes('')
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
          <DialogTitle>配賦イベント新規作成</DialogTitle>
          <DialogDescription>新しい配賦イベントを作成します</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="eventCode">
              イベントコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventCode"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="例: ALLOC-001"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName">
              イベント名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例: 本社経費配賦(実績)"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenarioType">
              シナリオタイプ <span className="text-destructive">*</span>
            </Label>
            <Select value={scenarioType} onValueChange={(v) => setScenarioType(v as ScenarioType)}>
              <SelectTrigger id="scenarioType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SCENARIO_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="備考を入力"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '作成中...' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
