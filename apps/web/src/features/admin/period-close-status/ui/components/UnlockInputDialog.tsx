'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/shared/ui'
import { AlertTriangle, Unlock } from 'lucide-react'

interface UnlockInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodLabel: string
  onConfirm: () => Promise<void>
  loading?: boolean
}

export function UnlockInputDialog({
  open,
  onOpenChange,
  periodLabel,
  onConfirm,
  loading,
}: UnlockInputDialogProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)

  const handleConfirm = async () => {
    setIsUnlocking(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleClose = () => {
    if (!isUnlocking) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-amber-600" />
            入力ロック解除
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{periodLabel}</span> の入力ロックを解除します。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 space-y-2">
              <p className="font-medium">以下の操作が実行されます：</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>配賦処理の実行結果が削除されます</li>
                <li>fact_amounts の配賦レコードが削除されます</li>
                <li>入力ロックが解除され、入力可能になります</li>
              </ul>
              <p className="pt-2 font-medium">この操作は取り消せません。</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || isUnlocking}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || isUnlocking}
          >
            <Unlock className="h-4 w-4 mr-1" />
            {isUnlocking ? '解除中...' : 'ロックを解除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
