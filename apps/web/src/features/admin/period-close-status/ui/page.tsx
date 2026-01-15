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
import { PeriodCloseStatusList, CloseConfirmDialog, ReopenConfirmDialog, AllocationConfirmDialog } from './components'
import { bffClient } from './api'
import type {
  BffPeriodCloseStatus,
  BffFiscalYear,
} from '@epm/contracts/bff/period-close-status'

export default function PeriodCloseStatusPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)

  // Data state
  const [periods, setPeriods] = useState<BffPeriodCloseStatus[]>([])
  const [companyId, setCompanyId] = useState<string>('company-001')
  const [companyName, setCompanyName] = useState<string>('')
  const [fiscalYears, setFiscalYears] = useState<BffFiscalYear[]>([])
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number | null>(null)

  // Dialog state
  const [softCloseDialog, setSoftCloseDialog] = useState<{
    open: boolean
    period: BffPeriodCloseStatus | null
  }>({ open: false, period: null })
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

  const handleSoftClose = useCallback((period: BffPeriodCloseStatus) => {
    setSoftCloseDialog({ open: true, period })
  }, [])

  const handleHardClose = useCallback((period: BffPeriodCloseStatus) => {
    setHardCloseDialog({ open: true, period })
  }, [])

  const handleReopen = useCallback((period: BffPeriodCloseStatus) => {
    setReopenDialog({ open: true, period })
  }, [])

  const executeSoftClose = async () => {
    const period = softCloseDialog.period
    if (!period) return

    setOperationLoading(true)
    try {
      const response = await bffClient.softClose({
        accountingPeriodId: period.accountingPeriodId,
      })

      if (response.success) {
        toast({
          title: '仮締め完了',
          description: `${period.periodLabel}を仮締めしました`,
        })
        await loadPeriods()
      } else {
        toast({
          title: 'エラー',
          description: response.errorMessage || '仮締めに失敗しました',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '仮締めに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setOperationLoading(false)
      setSoftCloseDialog({ open: false, period: null })
    }
  }

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

  const executeAllocation = async (dryRun: boolean) => {
    const period = allocationDialog.period
    if (!period) throw new Error('期間が選択されていません')

    const response = await bffClient.runAllocation({
      accountingPeriodId: period.accountingPeriodId,
      dryRun,
    })

    if (response.success && !dryRun) {
      toast({
        title: '配賦処理完了',
        description: `${period.periodLabel}の配賦処理を実行しました`,
      })
      setAllocationDialog({ open: false, period: null })
    } else if (!response.success) {
      toast({
        title: 'エラー',
        description: response.errorMessage || '配賦処理に失敗しました',
        variant: 'destructive',
      })
    }

    return response
  }

  const handleAllocation = useCallback((period: BffPeriodCloseStatus) => {
    setAllocationDialog({ open: true, period })
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-[1400px]">
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
            凡例: <span className="inline-flex items-center gap-1 mx-2">未締め(OPEN)</span> /
            <span className="inline-flex items-center gap-1 mx-2">仮締め(SOFT_CLOSED)</span> /
            <span className="inline-flex items-center gap-1 mx-2">本締め(HARD_CLOSED)</span>
          </p>
        </div>

        <PeriodCloseStatusList
          periods={periods}
          loading={loading || operationLoading}
          onSoftClose={handleSoftClose}
          onHardClose={handleHardClose}
          onReopen={handleReopen}
          onAllocation={handleAllocation}
        />
      </Card>

      {/* Dialogs */}
      <CloseConfirmDialog
        open={softCloseDialog.open}
        onOpenChange={(open) => setSoftCloseDialog({ open, period: open ? softCloseDialog.period : null })}
        type="soft"
        periodLabel={softCloseDialog.period?.periodLabel ?? ''}
        onConfirm={executeSoftClose}
        loading={operationLoading}
      />

      <CloseConfirmDialog
        open={hardCloseDialog.open}
        onOpenChange={(open) => setHardCloseDialog({ open, period: open ? hardCloseDialog.period : null })}
        type="hard"
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

      <AllocationConfirmDialog
        open={allocationDialog.open}
        onOpenChange={(open) => setAllocationDialog({ open, period: open ? allocationDialog.period : null })}
        periodLabel={allocationDialog.period?.periodLabel ?? ''}
        onExecute={executeAllocation}
        loading={operationLoading}
      />
    </div>
  )
}
