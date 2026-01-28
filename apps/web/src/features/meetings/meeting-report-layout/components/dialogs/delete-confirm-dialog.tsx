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
import { AlertTriangle } from 'lucide-react'
import type { TreeItemType } from '../../types'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemType: TreeItemType
  itemName: string
  childCount?: number
  isLoading?: boolean
  error?: string | null
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
  childCount = 0,
  isLoading,
  error,
}: DeleteConfirmDialogProps) {
  const getTitle = () => {
    switch (itemType) {
      case 'layout':
        return 'レイアウト削除'
      case 'page':
        return 'ページ削除'
      case 'component':
        return 'コンポーネント削除'
    }
  }

  const getDescription = () => {
    switch (itemType) {
      case 'layout':
        return childCount > 0
          ? `このレイアウトには ${childCount} 個のページがあります。レイアウトと関連データをすべて削除しますか？`
          : `「${itemName}」を削除しますか？`
      case 'page':
        return childCount > 0
          ? `このページには ${childCount} 個のコンポーネントがあります。ページとコンポーネントをすべて削除しますか？`
          : `「${itemName}」を削除しますか？`
      case 'component':
        return `「${itemName}」を削除しますか？`
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">{getDescription()}</AlertDialogDescription>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
