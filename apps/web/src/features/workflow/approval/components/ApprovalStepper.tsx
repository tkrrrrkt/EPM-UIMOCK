'use client'

import { Check, Circle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BffApproverStep } from '@epm/contracts/bff/approval'

interface ApprovalStepperProps {
  approvers: BffApproverStep[]
  currentStep: number
}

export function ApprovalStepper({ approvers, currentStep }: ApprovalStepperProps) {
  return (
    <div className="space-y-3">
      {approvers.map((approver, index) => {
        const isCompleted = approver.isCompleted
        const isCurrent = approver.isCurrent
        const isPending = !isCompleted && !isCurrent

        return (
          <div key={approver.step} className="flex items-start gap-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'border-green-500 bg-green-500 text-white',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isPending && 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{approver.step}</span>
                )}
              </div>
              {/* Connector line */}
              {index < approvers.length - 1 && (
                <div
                  className={cn(
                    'h-8 w-0.5 mt-1',
                    isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-green-700 dark:text-green-400',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  第{approver.step}承認
                </span>
                {approver.isCurrentUser && (
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    あなた
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>
                  {approver.approverEmployeeName || '未設定'}
                  {approver.deputyEmployeeName && (
                    <span className="ml-1 text-xs">（代理: {approver.deputyEmployeeName}）</span>
                  )}
                </span>
              </div>

              {isCompleted && approver.completedAt && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {approver.completedByEmployeeName && (
                    <span>{approver.completedByEmployeeName}が</span>
                  )}
                  {new Date(approver.completedAt).toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  に承認
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
