'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@/shared/ui'
import {
  PeriodCloseStatusList,
  CloseConfirmDialog,
  ReopenConfirmDialog,
  AllocationExecuteDialog,
  UnlockInputDialog,
  AllocationResultPage,
} from './components'
import { bffClient } from './api'
import type {
  BffPeriodCloseStatus,
  BffFiscalYear,
  BffAllocationEvent,
} from '@epm/contracts/bff/period-close-status'

export default function PeriodCloseStatusPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)

  // Data state
  const [periods, setPeriods] = useState<BffPeriodCloseStatus[]>([])
  const [companyId] = useState<string>('company-001')
  const [companyName, setCompanyName] = useState<string>('')
  const [fiscalYears, setFiscalYears] = useState<BffFiscalYear[]>([])
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number | null>(null)

  // Dialog state（仮締め廃止：本締めと差し戻しのみ）
  const [hardCloseDialog, setHardCloseDialog] = useState<{
    open: boolean
    period: BffPeriodCloseStatus | null
  }>({ open: false, period: null })
  const [reopenDialog, setReopenDialog] = useState<{
    open: boolean
    period: BffPeriodCloseStatus | null
  }>({ open: false, period: null })
  const [allocationDialog, setAllocationDialog] = useState<{
    open: boolean
    period: BffPeriodCloseStatus | null
  }>({ open: false, period: null })
  const [unlockDialog, setUnlockDialog] = useState<{
    open: boolean
    period: BffPeriodCloseStatus | null
  }>({ open: false, period: null })

  // View mode state
  const [viewMode, setViewMode] = useState<{
    mode: 'list' | 'allocation-result'
    period: BffPeriodCloseStatus | null
  }>({ mode: 'list', period: null })

  // Load fiscal years on mount
  useEffect(() => {
    loadFiscalYears()
  }, [companyId])

  // Load periods when fiscal year changes
  useEffect(() => {
    if (selectedFiscalYear) {
      loadPeriods()
    }
  }, [selectedFiscalYear, companyId])

  const loadFiscalYears = async () => {
    try {
      const response = await bffClient.getFiscalYears(companyId)
      setFiscalYears(response.fiscalYears)
      setSelectedFiscalYear(response.currentFiscalYear)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '年度情報の取得に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const loadPeriods = async () => {
    if (!selectedFiscalYear) return

    setLoading(true)
    try {
      const response = await bffClient.listPeriodCloseStatus({
        companyId,
        fiscalYear: selectedFiscalYear,
      })
      setPeriods(response.periods)
      setCompanyName(response.companyName)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '締め状況の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // 締め処理ハンドラ（本締め・差し戻しのみ）
  // ============================================================================

  const handleHardClose = useCallback((period: BffPeriodCloseStatus) => {
    setHardCloseDialog({ open: true, period })
  }, [])

  const handleReopen = useCallback((period: BffPeriodCloseStatus) => {
    setReopenDialog({ open: true, period })
  }, [])

  const executeHardClose = async () => {
    const period = hardCloseDialog.period
    if (!period) return

    setOperationLoading(true)
    try {
      const response = await bffClient.hardClose({
        accountingPeriodId: period.accountingPeriodId,
      })

      if (response.success) {
        toast({
          title: '本締め完了',
          description: `${period.periodLabel}を本締めしました`,
        })
        await loadPeriods()
      } else {
        toast({
          title: 'エラー',
          description: response.errorMessage || '本締めに失敗しました',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '本締めに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setOperationLoading(false)
      setHardCloseDialog({ open: false, period: null })
    }
  }

  const executeReopen = async (notes?: string) => {
    const period = reopenDialog.period
    if (!period) return

    setOperationLoading(true)
    try {
      const response = await bffClient.reopen({
        accountingPeriodId: period.accountingPeriodId,
        notes,
      })

      if (response.success) {
        toast({
          title: '差し戻し完了',
          description: `${period.periodLabel}を未締めに戻しました`,
        })
        await loadPeriods()
      } else {
        toast({
          title: 'エラー',
          description: response.errorMessage || '差し戻しに失敗しました',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '差し戻しに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setOperationLoading(false)
      setReopenDialog({ open: false, period: null })
    }
  }

  // ============================================================================
  // 配賦処理ハンドラ
  // ============================================================================

  const handleAllocation = useCallback((period: BffPeriodCloseStatus) => {
    setAllocationDialog({ open: true, period })
  }, [])

  const handleViewResult = useCallback((period: BffPeriodCloseStatus) => {
    setViewMode({ mode: 'allocation-result', period })
  }, [])

  const handleUnlockInput = useCallback((period: BffPeriodCloseStatus) => {
    setUnlockDialog({ open: true, period })
  }, [])

  const handleAllocationSettings = useCallback(() => {
    // TODO: 配賦設定画面に遷移
    // router.push('/master-data/allocation-master')
    toast({
      title: '配賦設定',
      description: '配賦マスタ設定画面へ遷移します（実装予定）',
    })
  }, [toast])

  const loadAllocationEvents = useCallback(async (): Promise<BffAllocationEvent[]> => {
    const response = await bffClient.listAllocationEvents({
      companyId,
      scenarioType: 'ACTUAL',
    })
    return response.events
  }, [companyId])

  const executeAllocation = useCallback(async (eventIds: string[]) => {
    const period = allocationDialog.period
    if (!period) throw new Error('期間が選択されていません')

    const response = await bffClient.executeAllocation({
      companyId,
      accountingPeriodId: period.accountingPeriodId,
      eventIds,
    })

    return response
  }, [companyId, allocationDialog.period])

  const handleAllocationSuccess = useCallback(async () => {
    const period = allocationDialog.period
    toast({
      title: '配賦処理完了',
      description: `${period?.periodLabel}の配賦処理を実行しました`,
    })
    await loadPeriods()
    // 配賦結果VIEW画面に遷移
    if (period) {
      setViewMode({ mode: 'allocation-result', period })
    }
  }, [allocationDialog.period, toast, loadPeriods])

  const handleBackToList = useCallback(() => {
    setViewMode({ mode: 'list', period: null })
  }, [])

  const executeUnlockInput = useCallback(async () => {
    const period = unlockDialog.period
    if (!period) return

    const response = await bffClient.unlockInput({
      accountingPeriodId: period.accountingPeriodId,
    })

    if (response.success) {
      toast({
        title: '入力ロック解除完了',
        description: `${period.periodLabel}の入力ロックを解除しました`,
      })
      await loadPeriods()
    } else {
      toast({
        title: 'エラー',
        description: response.errorMessage || '入力ロック解除に失敗しました',
        variant: 'destructive',
      })
    }
  }, [unlockDialog.period, toast, loadPeriods])

  // Show allocation result view
  if (viewMode.mode === 'allocation-result' && viewMode.period) {
    return (
      <AllocationResultPage
        companyId={companyId}
        accountingPeriodId={viewMode.period.accountingPeriodId}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">月次締処理状況</h1>
          <p className="text-muted-foreground mt-1">
            会計期間の締め処理状況を管理
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={loadPeriods} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">会社:</span>
            <span className="text-sm">{companyName || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">年度:</span>
            <Select
              value={selectedFiscalYear?.toString() ?? ''}
              onValueChange={(value) => setSelectedFiscalYear(Number(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.fiscalYear} value={fy.fiscalYear.toString()}>
                    {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            凡例: 未締め(OPEN) / 本締め(HARD_CLOSED) /
            <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">ロック中</span>
            = 配賦済み（入力不可）
          </p>
        </div>

        <PeriodCloseStatusList
          periods={periods}
          loading={loading || operationLoading}
          onHardClose={handleHardClose}
          onReopen={handleReopen}
          onAllocation={handleAllocation}
          onViewResult={handleViewResult}
          onUnlockInput={handleUnlockInput}
          onAllocationSettings={handleAllocationSettings}
        />
      </Card>

      {/* Dialogs（本締め・差し戻しのみ） */}
      <CloseConfirmDialog
        open={hardCloseDialog.open}
        onOpenChange={(open) => setHardCloseDialog({ open, period: open ? hardCloseDialog.period : null })}
        periodLabel={hardCloseDialog.period?.periodLabel ?? ''}
        onConfirm={executeHardClose}
        loading={operationLoading}
      />

      <ReopenConfirmDialog
        open={reopenDialog.open}
        onOpenChange={(open) => setReopenDialog({ open, period: open ? reopenDialog.period : null })}
        periodLabel={reopenDialog.period?.periodLabel ?? ''}
        onConfirm={executeReopen}
        loading={operationLoading}
      />

      <AllocationExecuteDialog
        open={allocationDialog.open}
        onOpenChange={(open) => setAllocationDialog({ open, period: open ? allocationDialog.period : null })}
        periodLabel={allocationDialog.period?.periodLabel ?? ''}
        companyId={companyId}
        accountingPeriodId={allocationDialog.period?.accountingPeriodId ?? ''}
        hasExistingResult={allocationDialog.period?.hasAllocationResult ?? false}
        onLoadEvents={loadAllocationEvents}
        onExecute={executeAllocation}
        onSuccess={handleAllocationSuccess}
        loading={operationLoading}
      />

      <UnlockInputDialog
        open={unlockDialog.open}
        onOpenChange={(open) => setUnlockDialog({ open, period: open ? unlockDialog.period : null })}
        periodLabel={unlockDialog.period?.periodLabel ?? ''}
        onConfirm={executeUnlockInput}
        loading={operationLoading}
      />
    </div>
  )
}
