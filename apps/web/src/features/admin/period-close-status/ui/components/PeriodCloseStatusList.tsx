'use client'

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui'
import type { BffPeriodCloseStatus, CloseStatus } from '@epm/contracts/bff/period-close-status'
import { AlertCircle, Calculator, Check, Eye, Lock, LockOpen, Settings, Undo2, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PeriodCloseStatusListProps {
  periods: BffPeriodCloseStatus[]
  loading?: boolean
  onHardClose: (period: BffPeriodCloseStatus) => void
  onReopen: (period: BffPeriodCloseStatus) => void
  onAllocation: (period: BffPeriodCloseStatus) => void
  onViewResult: (period: BffPeriodCloseStatus) => void
  onUnlockInput: (period: BffPeriodCloseStatus) => void
  onAllocationSettings?: () => void
}

// 締めステータス設定（仮締め廃止: OPEN / HARD_CLOSED のみ）
const STATUS_CONFIG: Record<CloseStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  OPEN: {
    label: '未締め',
    variant: 'outline',
    icon: <LockOpen className="h-3 w-3" />,
  },
  HARD_CLOSED: {
    label: '本締め',
    variant: 'default',
    icon: <Lock className="h-3 w-3" />,
  },
}

function formatDateTime(isoString: string | null): string {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PeriodCloseStatusList({
  periods,
  loading,
  onHardClose,
  onReopen,
  onAllocation,
  onViewResult,
  onUnlockInput,
  onAllocationSettings,
}: PeriodCloseStatusListProps) {
  if (periods.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">期間データがありません</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">期間</TableHead>
            <TableHead className="w-[120px]">ステータス</TableHead>
            <TableHead className="w-[100px]">入力ロック</TableHead>
            <TableHead className="w-[140px]">締め日時</TableHead>
            <TableHead className="w-[120px]">操作者</TableHead>
            <TableHead className="w-[200px]">チェック結果</TableHead>
            <TableHead className="w-[420px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => {
            const config = STATUS_CONFIG[period.closeStatus]

            return (
              <TableRow
                key={period.accountingPeriodId}
                className={cn(
                  period.closeStatus === 'HARD_CLOSED' && 'bg-muted/30',
                  period.closeStatus === 'OPEN' && period.inputLocked && 'bg-blue-50/50'
                )}
              >
                <TableCell className="font-medium">{period.periodLabel}</TableCell>
                <TableCell>
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {period.inputLocked ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                            <Lock className="h-3 w-3" />
                            ロック中
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{period.inputLockedBy} により {formatDateTime(period.inputLockedAt)} にロック</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(period.closedAt)}
                </TableCell>
                <TableCell className="text-sm">{period.operatedBy ?? '-'}</TableCell>
                <TableCell>
                  {period.checkResults && period.checkResults.length > 0 ? (
                    <div className="space-y-1">
                      {period.checkResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex items-center gap-1.5 text-xs',
                            result.passed ? 'text-green-600' : 'text-destructive'
                          )}
                        >
                          {result.passed ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{result.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {/* 配賦設定リンク（OPEN かつ 未ロック の場合） */}
                    {period.closeStatus === 'OPEN' && !period.inputLocked && onAllocationSettings && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={onAllocationSettings}
                              disabled={loading}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              配賦設定
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>配賦マスタ設定画面を開きます</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 配賦実行ボタン（配賦実行可能な場合） */}
                    {period.canRunAllocation && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAllocation(period)}
                              disabled={loading}
                            >
                              <Calculator className="h-3 w-3 mr-1" />
                              配賦実行
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>配賦マスタに基づき配賦処理を実行します</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 配賦結果ボタン（配賦結果がある場合） */}
                    {period.hasAllocationResult && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewResult(period)}
                              disabled={loading}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              結果
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>配賦結果を確認します</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 入力ロック解除ボタン（OPEN かつ ロック中 の場合） */}
                    {period.canUnlockInput && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => onUnlockInput(period)}
                              disabled={loading}
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              解除
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>入力ロックを解除します（配賦結果は削除されます）</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 本締めボタン（配賦済み & 前月本締め済み の場合） */}
                    {period.canHardClose && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onHardClose(period)}
                              disabled={loading}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              本締め
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>本締め後は変更できません</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 差し戻しボタン（HARD_CLOSED で権限者の場合） */}
                    {period.canReopen && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onReopen(period)}
                              disabled={loading}
                            >
                              <Undo2 className="h-3 w-3 mr-1" />
                              差し戻し
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>本締めを解除して未締めに戻します</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* 何も表示するものがない場合 */}
                    {!period.canHardClose && !period.canReopen &&
                     !period.canRunAllocation && !period.hasAllocationResult && !period.canUnlockInput &&
                     period.closeStatus === 'HARD_CLOSED' && (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
