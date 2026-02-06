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
  periodLabel: string
  onConfirm: () => void
  loading?: boolean
}

export function CloseConfirmDialog({
  open,
  onOpenChange,
  periodLabel,
  onConfirm,
  loading,
}: CloseConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            本締めの確認
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-medium">{periodLabel}</span>を本締めします。
              </p>
              <p className="text-sm text-destructive font-medium">
                本締め後は変更できません。
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            <Lock className="h-4 w-4 mr-1" />
            本締めを実行
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
