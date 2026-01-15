"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/components/button"
import { Textarea } from "@/shared/ui/components/textarea"
import { Avatar, AvatarFallback } from "@/shared/ui/components/avatar"
import { Edit2, Trash2, X, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import type { BffTaskComment } from "../types"

interface CommentsSectionProps {
  comments: BffTaskComment[]
  onAdd: (content: string) => Promise<void>
  onUpdate: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
}

export function CommentsSection({ comments, onAdd, onUpdate, onDelete }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await onAdd(newComment.trim())
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEdit = (comment: BffTaskComment) => {
    setEditingId(comment.id)
    setEditingContent(comment.content)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (editingContent.trim()) {
      setIsSubmitting(true)
      try {
        await onUpdate(commentId, editingContent.trim())
        setEditingId(null)
        setEditingContent("")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDelete = async (commentId: string) => {
    setIsSubmitting(true)
    try {
      await onDelete(commentId)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">コメント</h3>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{comment.authorName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="min-h-[60px]"
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editingContent.trim() || isSubmitting}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null)
                        setEditingContent("")
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-1" />
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  {comment.isOwner && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleStartEdit(comment)}
                        disabled={isSubmitting}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        削除
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          className="min-h-[80px]"
          disabled={isSubmitting}
        />
        <Button onClick={handleAdd} disabled={!newComment.trim() || isSubmitting} size="sm">
          コメントを追加
        </Button>
      </div>
    </div>
  )
}
