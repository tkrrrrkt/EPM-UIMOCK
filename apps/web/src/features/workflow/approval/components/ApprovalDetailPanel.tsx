'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Undo2, Send, Loader2, ExternalLink } from 'lucide-react'
import { Button, Card, Textarea } from '@/shared/ui'
import { ApprovalStepper } from './ApprovalStepper'
import { ApprovalHistory } from './ApprovalHistory'
import type {
  BffApprovalDetailResponse,
  BffApprovalActionRequest,
  BffApprovalHistoryItem,
  ApprovalStatus,
  ScenarioType,
} from '@epm/contracts/bff/approval'

interface ApprovalDetailPanelProps {
  detail: BffApprovalDetailResponse | null
  history: BffApprovalHistoryItem[]
  loading: boolean
  onSubmit: (id: string, request: BffApprovalActionRequest) => Promise<void>
  onApprove: (id: string, request: BffApprovalActionRequest) => Promise<void>
  onReject: (id: string, request: BffApprovalActionRequest) => Promise<void>
  onWithdraw: (id: string, request: BffApprovalActionRequest) => Promise<void>
}

const statusLabels: Record<ApprovalStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  APPROVED: '承認済み',
  REJECTED: '差し戻し',
  WITHDRAWN: '取り下げ',
}

const scenarioLabels: Record<ScenarioType, string> = {
  BUDGET: '予算',
  FORECAST: '見込',
}

export function ApprovalDetailPanel({
  detail,
  history,
  loading,
  onSubmit,
  onApprove,
  onReject,
  onWithdraw,
}: ApprovalDetailPanelProps) {
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  if (loading) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (!detail) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground">左側のリストから案件を選択してください</p>
      </Card>
    )
  }

  const handleAction = async (
    action: 'submit' | 'approve' | 'reject' | 'withdraw',
    handler: (id: string, request: BffApprovalActionRequest) => Promise<void>
  ) => {
    setActionLoading(action)
    try {
      await handler(detail.id, { comment: comment || undefined })
      setComment('')
    } finally {
      setActionLoading(null)
    }
  }

  // イベント詳細画面へのリンクURLを生成
  const getEntryPageUrl = () => {
    const basePath = detail.scenarioType === 'BUDGET'
      ? '/transactions/budget-entry'
      : '/transactions/forecast-entry'
    // VIEWモードで開く（部門・イベント情報をクエリパラメータで渡す）
    const params = new URLSearchParams({
      mode: 'view',
      departmentId: detail.departmentStableId,
      eventName: detail.eventName,
    })
    return `${basePath}?${params.toString()}`
  }

  return (
    <Card className="p-5">
      <div className="space-y-4">
        {/* Header - 部門名とイベントリンクを横並び */}
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">{detail.departmentName}</h2>
          <Link
            href={getEntryPageUrl()}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
          >
            {detail.eventName}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Info Grid - 横幅を活かして3列表示 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm border-y py-3">
          <div>
            <span className="text-muted-foreground text-xs">計画バージョン</span>
            <p className="font-medium truncate">{detail.planVersionName}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">種別</span>
            <p className="font-medium">{scenarioLabels[detail.scenarioType]}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">状態</span>
            <p className="font-medium">{statusLabels[detail.status]}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">ステップ</span>
            <p className="font-medium">{detail.currentStep}/5</p>
          </div>
          {detail.submittedAt && (
            <>
              <div>
                <span className="text-muted-foreground text-xs">提出日時</span>
                <p className="font-medium">
                  {new Date(detail.submittedAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">提出者</span>
                <p className="font-medium">{detail.submittedByEmployeeName || '-'}</p>
              </div>
            </>
          )}
        </div>

        {/* 承認フローと履歴を横並び */}
        <div className="grid grid-cols-2 gap-4">
          {/* Approval Steps */}
          <div>
            <h3 className="text-sm font-medium mb-2">承認フロー</h3>
            <ApprovalStepper approvers={detail.approvers} currentStep={detail.currentStep} />
          </div>

          {/* Approval History */}
          <div>
            <h3 className="text-sm font-medium mb-2">承認履歴</h3>
            {history.length > 0 ? (
              <ApprovalHistory items={history} />
            ) : (
              <p className="text-sm text-muted-foreground">履歴なし</p>
            )}
          </div>
        </div>

        {/* Comment Input と Action Buttons を横並び */}
        <div className="flex items-end gap-4 pt-2 border-t">
          <div className="flex-1">
            <label className="text-sm font-medium">コメント（任意）</label>
            <Textarea
              className="mt-1"
              placeholder="コメントを入力..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
          {detail.status === 'DRAFT' && (
            <Button
              onClick={() => handleAction('submit', onSubmit)}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'submit' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              提出する
            </Button>
          )}

          {detail.canApprove && (
            <Button
              variant="default"
              onClick={() => handleAction('approve', onApprove)}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'approve' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              承認する
            </Button>
          )}

          {detail.canReject && (
            <Button
              variant="destructive"
              onClick={() => handleAction('reject', onReject)}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'reject' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              差し戻す
            </Button>
          )}

          {detail.canWithdraw && (
            <Button
              variant="outline"
              onClick={() => handleAction('withdraw', onWithdraw)}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'withdraw' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="mr-2 h-4 w-4" />
              )}
              取り下げる
            </Button>
          )}
          </div>
        </div>
      </div>
    </Card>
  )
}
