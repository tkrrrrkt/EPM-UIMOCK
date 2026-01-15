'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui'
import { AlertTriangle, Lock } from 'lucide-react'

interface CloseConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'soft' | 'hard'
  periodLabel: string
  onConfirm: () => void
  loading?: boolean
}

export function CloseConfirmDialog({
  open,
  onOpenChange,
  type,
  periodLabel,
  onConfirm,
  loading,
}: CloseConfirmDialogProps) {
  const isSoft = type === 'soft'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {!isSoft && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {isSoft ? '仮締めの確認' : '本締めの確認'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-medium">{periodLabel}</span>を{isSoft ? '仮締め' : '本締め'}します。
              </p>
              {isSoft ? (
                <p className="text-sm">仮締め後は権限者のみ入力可能になります。</p>
              ) : (
                <p className="text-sm text-destructive font-medium">
                  本締め後は変更できません。
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={!isSoft ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            <Lock className="h-4 w-4 mr-1" />
            {isSoft ? '仮締めを実行' : '本締めを実行'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
