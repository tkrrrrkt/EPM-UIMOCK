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
import { AlertCircle, Calculator, Check, Lock, LockOpen, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PeriodCloseStatusListProps {
  periods: BffPeriodCloseStatus[]
  loading?: boolean
  onSoftClose: (period: BffPeriodCloseStatus) => void
  onHardClose: (period: BffPeriodCloseStatus) => void
  onReopen: (period: BffPeriodCloseStatus) => void
  onAllocation: (period: BffPeriodCloseStatus) => void
}

const STATUS_CONFIG: Record<CloseStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  OPEN: {
    label: '未締め',
    variant: 'outline',
    icon: <LockOpen className="h-3 w-3" />,
  },
  SOFT_CLOSED: {
    label: '仮締め',
    variant: 'secondary',
    icon: <Lock className="h-3 w-3" />,
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
  onSoftClose,
  onHardClose,
  onReopen,
  onAllocation,
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
            <TableHead className="w-[140px]">締め日時</TableHead>
            <TableHead className="w-[120px]">操作者</TableHead>
            <TableHead className="w-[280px]">チェック結果</TableHead>
            <TableHead className="w-[360px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => {
            const config = STATUS_CONFIG[period.closeStatus]
            const hasCheckWarning = period.checkResults?.some((r) => !r.passed)

            return (
              <TableRow
                key={period.accountingPeriodId}
                className={cn(
                  period.closeStatus === 'HARD_CLOSED' && 'bg-muted/30',
                  period.closeStatus === 'SOFT_CLOSED' && 'bg-yellow-50/50'
                )}
              >
                <TableCell className="font-medium">{period.periodLabel}</TableCell>
                <TableCell>
                  <Badge variant={config.variant} className="gap-1">
                    {config.icon}
                    {config.label}
                  </Badge>
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
                  <div className="flex gap-2">
                    {/* 実績配賦処理ボタン (SOFT_CLOSEDの場合のみ) */}
                    {period.closeStatus === 'SOFT_CLOSED' && (
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
                              実績配賦処理
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>配賦マスタに基づき配賦処理を実行します</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {/* 仮締めボタン (OPENの場合のみ) */}
                    {period.canSoftClose && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSoftClose(period)}
                              disabled={loading}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              仮締め
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>仮締め後は権限者のみ入力可能になります</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {/* 本締めボタン (SOFT_CLOSEDの場合のみ) */}
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
                    {/* 戻すボタン (SOFT_CLOSEDの場合のみ) */}
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
                              戻す
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>仮締めを解除して未締めに戻します</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {!period.canSoftClose && !period.canHardClose && !period.canReopen && period.closeStatus !== 'SOFT_CLOSED' && (
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
