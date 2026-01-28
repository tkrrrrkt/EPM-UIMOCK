'use client'

import React from 'react'
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
} from '@/shared/ui'

interface AddPeriodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (periodCode: string, targetValue?: number) => void
}

export function AddPeriodDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddPeriodDialogProps) {
  const [periodCode, setPeriodCode] = useState('')
  const [targetValue, setTargetValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (periodCode.trim()) {
      onSubmit(
        periodCode,
        targetValue ? Number(targetValue) : undefined
      )
      setPeriodCode('')
      setTargetValue('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>期間追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="periodCode">期間コード</Label>
            <Input
              id="periodCode"
              placeholder="例: Q1, 2026-01, 上期"
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetValue">目標値（任意）</Label>
            <Input
              id="targetValue"
              type="number"
              placeholder="目標値を入力"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
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
            <Button type="submit">追加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
