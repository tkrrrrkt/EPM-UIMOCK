"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Textarea } from "@/shared/ui/components/textarea"
import { Badge } from "@/shared/ui/components/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/components/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"
import { Calendar, Trash2 } from "lucide-react"
import { ChecklistSection } from "./ChecklistSection"
import { CommentsSection } from "./CommentsSection"
import { LabelSelector } from "./LabelSelector"
import { AssigneeSelector } from "./AssigneeSelector"
import { getErrorMessage } from "../lib/error-messages"
import { toast } from "sonner"
import type { BffClient } from "../api/BffClient"
import type { BffTaskDetail, BffTaskLabel } from "../types"

interface TaskDetailModalProps {
  taskId: string | null
  isOpen: boolean
  onClose: () => void
  client: BffClient
  planId: string
  availableLabels: BffTaskLabel[]
}

export function TaskDetailModal({ taskId, isOpen, onClose, client, planId, availableLabels }: TaskDetailModalProps) {
  const [task, setTask] = useState<BffTaskDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskName, setTaskName] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (taskId && isOpen) {
      loadTask()
    }
  }, [taskId, isOpen])

  const loadTask = async () => {
    if (!taskId) return
    setIsLoading(true)
    try {
      const data = await client.getTaskDetail(taskId)
      setTask(data)
      setTaskName(data.taskName)
      setDescription(data.description || "")
      setDueDate(data.dueDate || "")
    } catch (error) {
      toast.error(getErrorMessage(error))
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateField = async (updates: { taskName?: string; description?: string; dueDate?: string }) => {
    if (!task) return
    try {
      const updated = await client.updateTask(task.id, {
        ...updates,
        updatedAt: task.updatedAt,
      })
      setTask(updated)
      toast.success("更新しました")
    } catch (error) {
      toast.error(getErrorMessage(error))
      await loadTask()
    }
  }

  const handleDelete = async () => {
    if (!task) return
    try {
      await client.deleteTask(task.id)
      toast.success("タスクを削除しました")
      setShowDeleteDialog(false)
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleLabelToggle = async (labelId: string, isSelected: boolean) => {
    if (!task) return
    try {
      if (isSelected) {
        await client.removeLabel(task.id, labelId)
      } else {
        await client.addLabel(task.id, { labelId })
      }
      await loadTask()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAssigneeToggle = async (employeeId: string, isSelected: boolean) => {
    if (!task) return
    try {
      if (isSelected) {
        await client.removeAssignee(task.id, employeeId)
      } else {
        await client.addAssignee(task.id, { employeeId })
      }
      await loadTask()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleChecklistAdd = async (itemName: string) => {
    if (!task) return
    await client.addChecklistItem(task.id, { itemName })
    await loadTask()
  }

  const handleChecklistUpdate = async (itemId: string, updates: { itemName?: string; isCompleted?: boolean }) => {
    await client.updateChecklistItem(itemId, updates)
    await loadTask()
  }

  const handleChecklistDelete = async (itemId: string) => {
    await client.deleteChecklistItem(itemId)
    await loadTask()
  }

  const handleCommentAdd = async (content: string) => {
    if (!task) return
    await client.addComment(task.id, { content })
    await loadTask()
  }

  const handleCommentUpdate = async (commentId: string, content: string) => {
    await client.updateComment(commentId, { content })
    await loadTask()
  }

  const handleCommentDelete = async (commentId: string) => {
    await client.deleteComment(commentId)
    await loadTask()
  }

  if (!task && !isLoading) return null

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">読み込み中...</div>
            </div>
          ) : task ? (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <SheetTitle className="text-xl">タスク詳細</SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Input
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      onBlur={() => {
                        if (taskName !== task.taskName && taskName.trim()) {
                          handleUpdateField({ taskName: taskName.trim() })
                        }
                      }}
                      className="text-lg font-semibold"
                      placeholder="タスク名"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">説明</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => {
                        if (description !== (task.description || "")) {
                          handleUpdateField({ description: description || undefined })
                        }
                      }}
                      className="min-h-[120px]"
                      placeholder="説明を入力..."
                    />
                  </div>

                  <ChecklistSection
                    items={task.checklist}
                    onAdd={handleChecklistAdd}
                    onUpdate={handleChecklistUpdate}
                    onDelete={handleChecklistDelete}
                  />

                  <CommentsSection
                    comments={task.comments}
                    onAdd={handleCommentAdd}
                    onUpdate={handleCommentUpdate}
                    onDelete={handleCommentDelete}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ラベル</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.labels.map((label) => (
                        <Badge
                          key={label.id}
                          variant="secondary"
                          style={{
                            backgroundColor: label.colorCode,
                            color: "#fff",
                          }}
                        >
                          {label.labelName}
                        </Badge>
                      ))}
                    </div>
                    <LabelSelector
                      availableLabels={availableLabels}
                      selectedLabels={task.labels}
                      onToggle={handleLabelToggle}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">担当者</label>
                    <div className="space-y-1 mb-2">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.employeeId} className="text-sm">
                          {assignee.employeeName}
                        </div>
                      ))}
                    </div>
                    <AssigneeSelector selectedAssignees={task.assignees} onToggle={handleAssigneeToggle} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      期限
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      onBlur={() => {
                        if (dueDate !== (task.dueDate || "")) {
                          handleUpdateField({ dueDate: dueDate || undefined })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。関連するチェックリスト・コメントも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
