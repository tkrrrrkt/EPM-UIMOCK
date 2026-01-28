'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import {
  Calendar,
  Tag,
  Users,
  CheckSquare,
  MessageSquare,
  Trash2,
  Plus,
  X,
  MoreHorizontal,
  Edit2,
  Loader2,
} from 'lucide-react'
import { getBffClient } from '../api/client'
import type {
  BffTaskDetail,
  BffTaskStatus,
  BffTaskLabel,
  BffSelectableEmployee,
  BffChecklistItem,
  BffTaskComment,
} from '../lib/types'

// ============================================
// Types
// ============================================

interface TaskDetailModalProps {
  taskId: string
  planId: string
  statuses: BffTaskStatus[]
  labels: BffTaskLabel[]
  employees: BffSelectableEmployee[]
  onClose: (updated: boolean) => void
}

// ============================================
// Main Component
// ============================================

export function TaskDetailModal({
  taskId,
  planId,
  statuses,
  labels,
  employees,
  onClose,
}: TaskDetailModalProps) {
  const [task, setTask] = React.useState<BffTaskDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Form state
  const [taskName, setTaskName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [statusId, setStatusId] = React.useState('')
  const [newChecklistItem, setNewChecklistItem] = React.useState('')
  const [newComment, setNewComment] = React.useState('')

  // Load task detail
  React.useEffect(() => {
    const loadTask = async () => {
      try {
        setIsLoading(true)
        const client = getBffClient()
        const data = await client.getTaskDetail(taskId)
        setTask(data)
        setTaskName(data.taskName)
        setDescription(data.description || '')
        setDueDate(data.dueDate || '')
        setStatusId(data.statusId)
      } catch (err) {
        console.error('Failed to load task:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadTask()
  }, [taskId])

  // Save changes
  const saveChanges = async () => {
    if (!task) return
    try {
      setIsSaving(true)
      const client = getBffClient()

      // Update task
      await client.updateTask(taskId, {
        taskName,
        description: description || undefined,
        dueDate: dueDate || null,
        updatedAt: task.updatedAt,
      })

      // Update status if changed
      if (statusId !== task.statusId) {
        await client.updateTaskStatus(taskId, { statusId, sortOrder: 0 })
      }

      setHasChanges(true)
    } catch (err) {
      console.error('Failed to save task:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Checklist handlers
  const handleAddChecklist = async () => {
    if (!newChecklistItem.trim()) return
    try {
      const client = getBffClient()
      const item = await client.createChecklistItem(taskId, { itemName: newChecklistItem })
      setTask((prev) => prev && { ...prev, checklist: [...prev.checklist, item] })
      setNewChecklistItem('')
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to add checklist item:', err)
    }
  }

  const handleToggleChecklist = async (item: BffChecklistItem) => {
    try {
      const client = getBffClient()
      await client.updateChecklistItem(item.id, { isCompleted: !item.isCompleted })
      setTask((prev) =>
        prev && {
          ...prev,
          checklist: prev.checklist.map((c) =>
            c.id === item.id ? { ...c, isCompleted: !c.isCompleted } : c
          ),
        }
      )
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to toggle checklist:', err)
    }
  }

  const handleDeleteChecklist = async (itemId: string) => {
    try {
      const client = getBffClient()
      await client.deleteChecklistItem(itemId)
      setTask((prev) =>
        prev && { ...prev, checklist: prev.checklist.filter((c) => c.id !== itemId) }
      )
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to delete checklist item:', err)
    }
  }

  // Comment handlers
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const client = getBffClient()
      const comment = await client.createComment(taskId, { content: newComment })
      setTask((prev) => prev && { ...prev, comments: [comment, ...prev.comments] })
      setNewComment('')
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const client = getBffClient()
      await client.deleteComment(commentId)
      setTask((prev) =>
        prev && { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
      )
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  // Label handlers
  const handleAddLabel = async (labelId: string) => {
    try {
      const client = getBffClient()
      await client.addLabel(taskId, { labelId })
      const label = labels.find((l) => l.id === labelId)
      if (label) {
        setTask((prev) =>
          prev && {
            ...prev,
            labels: [...prev.labels, { id: label.id, labelName: label.labelName, colorCode: label.colorCode }],
          }
        )
      }
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to add label:', err)
    }
  }

  const handleRemoveLabel = async (labelId: string) => {
    try {
      const client = getBffClient()
      await client.removeLabel(taskId, labelId)
      setTask((prev) =>
        prev && { ...prev, labels: prev.labels.filter((l) => l.id !== labelId) }
      )
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to remove label:', err)
    }
  }

  // Assignee handlers
  const handleAddAssignee = async (employeeId: string) => {
    try {
      const client = getBffClient()
      await client.addAssignee(taskId, { employeeId })
      const employee = employees.find((e) => e.id === employeeId)
      if (employee) {
        setTask((prev) =>
          prev && {
            ...prev,
            assignees: [...prev.assignees, { employeeId: employee.id, employeeName: employee.name }],
          }
        )
      }
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to add assignee:', err)
    }
  }

  const handleRemoveAssignee = async (employeeId: string) => {
    try {
      const client = getBffClient()
      await client.removeAssignee(taskId, employeeId)
      setTask((prev) =>
        prev && { ...prev, assignees: prev.assignees.filter((a) => a.employeeId !== employeeId) }
      )
      setHasChanges(true)
    } catch (err) {
      console.error('Failed to remove assignee:', err)
    }
  }

  // Delete task
  const handleDeleteTask = async () => {
    if (!confirm('このタスクを削除しますか？')) return
    try {
      const client = getBffClient()
      await client.deleteTask(taskId)
      onClose(true)
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  if (isLoading || !task) {
    return (
      <Dialog open onOpenChange={() => onClose(hasChanges)}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const availableLabels = labels.filter((l) => !task.labels.some((tl) => tl.id === l.id))
  const availableEmployees = employees.filter(
    (e) => !task.assignees.some((a) => a.employeeId === e.id)
  )

  return (
    <Dialog open onOpenChange={() => onClose(hasChanges)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">タスク詳細</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={handleDeleteTask}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Name */}
          <div>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={saveChanges}
              className="text-xl font-semibold border-none p-0 focus:ring-0"
              placeholder="タスク名"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-gray-500">ステータス</Label>
            <Select
              value={statusId}
              onValueChange={(value) => {
                setStatusId(value)
                saveChanges()
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      {status.colorCode && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.colorCode }}
                        />
                      )}
                      {status.statusName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-4">
            <Label className="w-24 text-gray-500">
              <Calendar className="h-4 w-4 inline mr-1" />
              期限
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={saveChanges}
              className="w-48"
            />
          </div>

          {/* Labels */}
          <div className="flex items-start gap-4">
            <Label className="w-24 text-gray-500 pt-2">
              <Tag className="h-4 w-4 inline mr-1" />
              ラベル
            </Label>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-white"
                    style={{ backgroundColor: label.colorCode }}
                  >
                    {label.labelName}
                    <button onClick={() => handleRemoveLabel(label.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {availableLabels.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        追加
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {availableLabels.map((label) => (
                        <DropdownMenuItem
                          key={label.id}
                          onClick={() => handleAddLabel(label.id)}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: label.colorCode }}
                          />
                          {label.labelName}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="flex items-start gap-4">
            <Label className="w-24 text-gray-500 pt-2">
              <Users className="h-4 w-4 inline mr-1" />
              担当者
            </Label>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {task.assignees.map((assignee) => (
                  <span
                    key={assignee.employeeId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      {assignee.employeeName.charAt(0)}
                    </div>
                    {assignee.employeeName}
                    <button onClick={() => handleRemoveAssignee(assignee.employeeId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {availableEmployees.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        追加
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {availableEmployees.map((employee) => (
                        <DropdownMenuItem
                          key={employee.id}
                          onClick={() => handleAddAssignee(employee.id)}
                        >
                          {employee.name}
                          {employee.departmentName && (
                            <span className="text-gray-400 ml-2">({employee.departmentName})</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-gray-500 mb-2 block">説明</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveChanges}
              placeholder="タスクの説明を入力..."
              className="min-h-24"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-gray-500" />
              <Label className="text-gray-500">チェックリスト</Label>
              {task.checklist.length > 0 && (
                <span className="text-sm text-gray-400">
                  ({task.checklist.filter((c) => c.isCompleted).length}/{task.checklist.length})
                </span>
              )}
            </div>
            <div className="space-y-2">
              {task.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={() => handleToggleChecklist(item)}
                  />
                  <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                    {item.itemName}
                  </span>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                  placeholder="項目を追加..."
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddChecklist} disabled={!newChecklistItem.trim()}>
                  追加
                </Button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <Label className="text-gray-500">コメント</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力..."
                  className="flex-1 min-h-20"
                />
              </div>
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                コメント投稿
              </Button>

              <div className="space-y-3 mt-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                          {comment.authorName.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{comment.authorName}</span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      {comment.isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Helpers
// ============================================

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
