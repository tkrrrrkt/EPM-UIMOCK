'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Textarea,
} from '@/shared/ui'
import { Undo2 } from 'lucide-react'

interface ReopenConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodLabel: string
  onConfirm: (notes?: string) => void
  loading?: boolean
}

export function ReopenConfirmDialog({
  open,
  onOpenChange,
  periodLabel,
  onConfirm,
  loading,
}: ReopenConfirmDialogProps) {
  const [notes, setNotes] = useState('')

  const handleConfirm = () => {
    onConfirm(notes || undefined)
    setNotes('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNotes('')
    }
    onOpenChange(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>仮締め解除の確認</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                <span className="font-medium">{periodLabel}</span>の仮締めを解除して未締めに戻します。
              </p>
              <div className="space-y-2">
                <Label htmlFor="notes">理由（任意）</Label>
                <Textarea
                  id="notes"
                  placeholder="差し戻しの理由を入力してください"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            <Undo2 className="h-4 w-4 mr-1" />
            戻す
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
