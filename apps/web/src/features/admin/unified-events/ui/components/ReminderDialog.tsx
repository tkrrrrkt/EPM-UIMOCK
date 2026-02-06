'use client'

import { useState } from 'react'
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/shared/ui'
import type { BffDepartmentSubmission } from '@epm/contracts/bff/unified-events'
import { AlertTriangle, Mail, Users } from 'lucide-react'

interface ReminderDialogProps {
  open: boolean
  selectedDepartments: BffDepartmentSubmission[]
  onClose: () => void
  onConfirm: (message: string) => void
}

export function ReminderDialog({
  open,
  selectedDepartments,
  onClose,
  onConfirm,
}: ReminderDialogProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for already submitted/approved departments (shouldn't happen, but guard)
  const nonRemindable = selectedDepartments.filter((d) =>
    ['SUBMITTED', 'APPROVED'].includes(d.status)
  )

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(message)
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            催促送信
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning for non-remindable departments */}
          {nonRemindable.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                提出済・承認済の部門が含まれています。これらは催促対象外です。
              </AlertDescription>
            </Alert>
          )}

          {/* Selected departments list */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                送信先部門 ({selectedDepartments.length}件)
              </span>
            </div>
            <div className="max-h-[120px] overflow-y-auto border rounded-md p-2 bg-muted/30">
              {selectedDepartments.map((dept) => (
                <div
                  key={dept.departmentId}
                  className="text-sm py-0.5"
                  style={{ paddingLeft: `${(dept.departmentLevel - 1) * 12}px` }}
                >
                  {dept.departmentLevel > 1 && (
                    <span className="text-muted-foreground mr-1">└</span>
                  )}
                  {dept.departmentName}
                </div>
              ))}
            </div>
          </div>

          {/* Message input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              メッセージ (任意)
            </label>
            <Textarea
              placeholder="催促メッセージを入力してください..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ※ Phase 1ではメッセージ送信のシミュレーションのみ行います
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={loading || selectedDepartments.length === 0}>
            {loading ? '送信中...' : '催促を送信'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
