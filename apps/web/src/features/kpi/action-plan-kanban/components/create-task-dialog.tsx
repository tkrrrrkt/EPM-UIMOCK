'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Label,
} from '@/shared/ui'
import { Loader2 } from 'lucide-react'
import { getBffClient } from '../api/client'

// ============================================
// Types
// ============================================

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  statusId?: string
  onCreated: () => void
}

// ============================================
// Main Component
// ============================================

export function CreateTaskDialog({
  open,
  onOpenChange,
  planId,
  statusId,
  onCreated,
}: CreateTaskDialogProps) {
  const [taskName, setTaskName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setTaskName('')
      setDescription('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskName.trim()) {
      setError('タスク名を入力してください')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const client = getBffClient()
      await client.createTask({
        planId,
        taskName: taskName.trim(),
        statusId,
        description: description.trim() || undefined,
      })

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>タスクを作成</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">タスク名 *</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="タスク名を入力"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="タスクの説明（任意）"
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting || !taskName.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
