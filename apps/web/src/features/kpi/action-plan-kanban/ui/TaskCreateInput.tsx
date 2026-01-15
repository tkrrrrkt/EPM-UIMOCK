"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Plus, X } from "lucide-react"

interface TaskCreateInputProps {
  statusId: string
  onSubmit: (taskName: string, statusId: string) => Promise<void>
}

export function TaskCreateInput({ statusId, onSubmit }: TaskCreateInputProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [taskName, setTaskName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!taskName.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(taskName.trim(), statusId)
      setTaskName("")
      setIsCreating(false)
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      setIsCreating(false)
      setTaskName("")
    }
  }

  if (!isCreating) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        タスクを追加
      </Button>
    )
  }

  return (
    <div className="space-y-2 p-2 border rounded-md bg-card">
      <Input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="タスク名を入力..."
        disabled={isSubmitting}
        autoFocus
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!taskName.trim() || isSubmitting} size="sm">
          追加
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsCreating(false)
            setTaskName("")
          }}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
