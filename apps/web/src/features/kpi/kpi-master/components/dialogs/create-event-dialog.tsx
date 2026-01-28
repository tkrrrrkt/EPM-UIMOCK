'use client'

import React from 'react'
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
} from '@/shared/ui'
import type { BffKpiEvent } from '../../lib/types'

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    eventCode: string
    eventName: string
    fiscalYear: number
  }) => void
  editingEvent?: BffKpiEvent | null
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onSubmit,
  editingEvent,
}: CreateEventDialogProps) {
  const currentYear = new Date().getFullYear()
  const [eventCode, setEventCode] = useState('')
  const [eventName, setEventName] = useState('')
  const [fiscalYear, setFiscalYear] = useState(currentYear)

  useEffect(() => {
    if (editingEvent) {
      setEventCode(editingEvent.eventCode)
      setEventName(editingEvent.eventName)
      setFiscalYear(editingEvent.fiscalYear)
    } else {
      setEventCode(`KPI-${currentYear}`)
      setEventName(`${currentYear}年度 KPI管理`)
      setFiscalYear(currentYear)
    }
  }, [editingEvent, currentYear])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (eventCode.trim() && eventName.trim()) {
      onSubmit({
        eventCode,
        eventName,
        fiscalYear,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'イベント編集' : '新規イベント作成'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventCode">イベントコード</Label>
            <Input
              id="eventCode"
              placeholder="例: KPI-2026"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventName">イベント名</Label>
            <Input
              id="eventName"
              placeholder="例: 2026年度 KPI管理"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalYear">年度</Label>
            <Input
              id="fiscalYear"
              type="number"
              min={2020}
              max={2100}
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">
              {editingEvent ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
