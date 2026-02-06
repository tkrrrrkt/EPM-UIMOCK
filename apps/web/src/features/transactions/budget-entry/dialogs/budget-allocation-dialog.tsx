'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@/shared/ui'
import { Calculator, Play, AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type {
  BffBudgetAllocationEvent,
  BffExecuteBudgetAllocationResponse,
} from '@epm/contracts/bff/budget-entry'

interface BudgetAllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planEventId: string
  planEventName: string
  planVersionId: string
  planVersionName: string
  scenarioType: 'BUDGET' | 'FORECAST'
  hasExistingResult: boolean
  onLoadEvents: () => Promise<BffBudgetAllocationEvent[]>
  onExecute: (eventIds: string[]) => Promise<BffExecuteBudgetAllocationResponse>
  onSuccess: () => void
}

export function BudgetAllocationDialog({
  open,
  onOpenChange,
  planEventId,
  planEventName,
  planVersionId,
  planVersionName,
  scenarioType,
  hasExistingResult,
  onLoadEvents,
  onExecute,
  onSuccess,
}: BudgetAllocationDialogProps) {
  const [events, setEvents] = useState<BffBudgetAllocationEvent[]>([])
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executeResult, setExecuteResult] = useState<BffExecuteBudgetAllocationResponse | null>(null)

  // Load events when dialog opens
  useEffect(() => {
    if (open) {
      loadEvents()
    } else {
      // Reset state when dialog closes
      setEvents([])
      setSelectedEventIds([])
      setExecuteResult(null)
    }
  }, [open])

  const loadEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const loadedEvents = await onLoadEvents()
      setEvents(loadedEvents)
      // Select all active events by default
      setSelectedEventIds(loadedEvents.filter(e => e.isActive).map(e => e.id))
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleToggleEvent = useCallback((eventId: string) => {
    setSelectedEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }, [])

  const handleToggleAll = useCallback(() => {
    const activeEventIds = events.filter(e => e.isActive).map(e => e.id)
    if (selectedEventIds.length === activeEventIds.length) {
      setSelectedEventIds([])
    } else {
      setSelectedEventIds(activeEventIds)
    }
  }, [events, selectedEventIds])

  const handleExecute = async () => {
    if (selectedEventIds.length === 0) return

    setIsExecuting(true)
    try {
      // Sort by execution_order
      const sortedEventIds = events
        .filter(e => selectedEventIds.includes(e.id))
        .sort((a, b) => a.executionOrder - b.executionOrder)
        .map(e => e.id)

      const result = await onExecute(sortedEventIds)
      setExecuteResult(result)

      if (result.success) {
        // Wait a moment to show success, then close and refresh
        setTimeout(() => {
          onOpenChange(false)
          onSuccess()
        }, 1500)
      }
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClose = () => {
    if (!isExecuting) {
      onOpenChange(false)
    }
  }

  const activeEventIds = events.filter(e => e.isActive).map(e => e.id)
  const allSelected = activeEventIds.length > 0 && selectedEventIds.length === activeEventIds.length

  const scenarioLabel = scenarioType === 'BUDGET' ? '予算' : '見込'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {scenarioLabel}配賦処理の実行
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{planEventName}</span> / <span className="font-medium">{planVersionName}</span> の配賦処理を実行します。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 警告メッセージ */}
          {hasExistingResult && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">前回の配賦結果があります</p>
                <p>実行すると前回の配賦結果は削除され、再計算されます。</p>
              </div>
            </div>
          )}

          {/* イベント一覧 */}
          {isLoadingEvents ? (
            <div className="p-8 text-center text-muted-foreground">
              読み込み中...
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {scenarioLabel}用の配賦イベントが登録されていません
            </div>
          ) : executeResult ? (
            // 実行結果表示
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">配賦処理が完了しました</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配賦イベント</TableHead>
                    <TableHead className="text-right">ステータス</TableHead>
                    <TableHead className="text-right">明細数</TableHead>
                    <TableHead className="text-right">配賦金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executeResult.results.map((result) => (
                    <TableRow key={result.eventId}>
                      <TableCell>{result.eventName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={result.status === 'SUCCESS' ? 'default' : 'destructive'}>
                          {result.status === 'SUCCESS' ? '成功' : '失敗'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{result.detailCount}件</TableCell>
                      <TableCell className="text-right font-mono">
                        ¥{result.totalAllocatedAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // イベント選択
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[56px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleToggleAll}
                        disabled={isExecuting}
                      />
                    </TableHead>
                    <TableHead className="w-[70px]">順序</TableHead>
                    <TableHead className="min-w-[280px]">配賦イベント</TableHead>
                    <TableHead className="w-[120px] text-center">シナリオ</TableHead>
                    <TableHead className="w-[100px] text-right">ステップ数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id}
                      className={!event.isActive ? 'opacity-50' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedEventIds.includes(event.id)}
                          onCheckedChange={() => handleToggleEvent(event.id)}
                          disabled={!event.isActive || isExecuting}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-center">
                        [{event.executionOrder}]
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="font-medium">{event.eventName}</div>
                            <div className="text-xs text-muted-foreground">{event.eventCode}</div>
                          </div>
                          <Link
                            href={`/master-data/allocation-master?eventId=${event.id}`}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="配賦マスタを開く"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{event.scenarioType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{event.stepCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* 注意事項 */}
          {!executeResult && events.length > 0 && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>※ 番号順（execution_order）に配賦処理が実行されます</p>
              <p>※ 配賦完了後、このバージョンの入力がロックされます</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!executeResult && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isExecuting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isExecuting || selectedEventIds.length === 0}
              >
                <Play className="h-4 w-4 mr-1" />
                {isExecuting ? '実行中...' : `配賦を実行 (${selectedEventIds.length}件)`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
