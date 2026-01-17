'use client'

import { Clock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BffApprovalHistoryItem, ApprovalAction } from '@epm/contracts/bff/approval'

interface ApprovalHistoryProps {
  items: BffApprovalHistoryItem[]
}

const actionLabels: Record<ApprovalAction, string> = {
  SUBMIT: '提出',
  APPROVE: '承認',
  REJECT: '差し戻し',
  WITHDRAW: '取り下げ',
  SKIP: 'スキップ',
}

const actionStyles: Record<ApprovalAction, string> = {
  SUBMIT: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  APPROVE: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  REJECT: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  WITHDRAW: 'bg-muted text-muted-foreground',
  SKIP: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
}

export function ApprovalHistory({ items }: ApprovalHistoryProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">履歴がありません</p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'relative pl-6 pb-3',
            index < items.length - 1 && 'border-l-2 border-muted ml-2'
          )}
        >
          {/* Timeline dot */}
          <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-muted-foreground/30" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                  actionStyles[item.action]
                )}
              >
                {actionLabels[item.action]}
              </span>
              {item.step > 0 && (
                <span className="text-xs text-muted-foreground">
                  第{item.step}承認
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{item.actorEmployeeName}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(item.actedAt).toLocaleString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {item.comment && (
              <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{item.comment}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
