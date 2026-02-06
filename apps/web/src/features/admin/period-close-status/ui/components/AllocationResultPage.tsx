'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { ArrowLeft, FileSpreadsheet, FileDown, RefreshCw, Calendar } from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  useToast,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { AllocationResultGrid } from './AllocationResultGrid'
import { bffClient } from '../api'
import type {
  BffAllocationResultResponse,
  BffAllocationTreeNode,
  BffAllocationExecution,
} from '@epm/contracts/bff/period-close-status'

interface AllocationResultPageProps {
  companyId: string
  accountingPeriodId: string
  onBack?: () => void
}

/**
 * 配賦結果をツリーノード形式に変換
 */
function convertToTreeNodes(executions: BffAllocationExecution[]): BffAllocationTreeNode[] {
  const nodes: BffAllocationTreeNode[] = []

  executions.forEach((execution) => {
    // Event level node
    const eventTotalAmount = execution.steps.reduce(
      (sum, step) => sum + step.details.reduce((s, d) => s + d.allocatedAmount, 0),
      0
    )

    nodes.push({
      id: `event-${execution.executionId}`,
      orgHierarchy: [execution.eventName],
      nodeType: 'EVENT',
      eventName: execution.eventName,
      amount: eventTotalAmount,
    })

    execution.steps.forEach((step) => {
      // Step level node
      const stepTotalAmount = step.details.reduce((s, d) => s + d.allocatedAmount, 0)

      nodes.push({
        id: `step-${step.stepId}`,
        orgHierarchy: [execution.eventName, `${step.stepNo}. ${step.stepName}`],
        nodeType: 'STEP',
        stepName: `${step.stepNo}. ${step.stepName}`,
        fromSubject: `${step.fromSubjectCode}: ${step.fromSubjectName}`,
        fromDepartment: `${step.fromDepartmentCode}: ${step.fromDepartmentName}`,
        amount: stepTotalAmount,
      })

      step.details.forEach((detail) => {
        // Detail level node
        nodes.push({
          id: `detail-${detail.detailId}`,
          orgHierarchy: [
            execution.eventName,
            `${step.stepNo}. ${step.stepName}`,
            detail.targetName,
          ],
          nodeType: 'DETAIL',
          targetName: detail.targetName,
          toSubject: `${detail.toSubjectCode}: ${detail.toSubjectName}`,
          driverType: detail.driverType,
          ratio: detail.ratio,
          amount: detail.allocatedAmount,
        })
      })
    })
  })

  return nodes
}

export function AllocationResultPage({
  companyId,
  accountingPeriodId,
  onBack,
}: AllocationResultPageProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BffAllocationResultResponse | null>(null)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>('all')

  const loadResult = useCallback(async () => {
    setLoading(true)
    try {
      const response = await bffClient.getAllocationResult({
        companyId,
        accountingPeriodId,
      })
      setResult(response)

      if (response.executions.length === 0) {
        toast({
          title: '配賦結果なし',
          description: 'この期間の配賦結果はありません',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '配賦結果の取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [companyId, accountingPeriodId, toast])

  useEffect(() => {
    loadResult()
  }, [loadResult])

  // Filter executions based on selection
  const filteredExecutions = useMemo(() => {
    if (!result) return []
    if (selectedExecutionId === 'all') return result.executions
    return result.executions.filter((e) => e.executionId === selectedExecutionId)
  }, [result, selectedExecutionId])

  // Convert to tree nodes
  const treeNodes = useMemo(() => {
    return convertToTreeNodes(filteredExecutions)
  }, [filteredExecutions])

  // Summary calculations
  const summary = useMemo(() => {
    if (!result || result.executions.length === 0) return null

    let totalSteps = 0
    let totalDetails = 0
    let totalAmount = 0

    filteredExecutions.forEach((exec) => {
      totalSteps += exec.steps.length
      exec.steps.forEach((step) => {
        totalDetails += step.details.length
        step.details.forEach((detail) => {
          totalAmount += detail.allocatedAmount
        })
      })
    })

    return {
      eventCount: filteredExecutions.length,
      stepCount: totalSteps,
      detailCount: totalDetails,
      totalAmount,
    }
  }, [result, filteredExecutions])

  const handleExportExcel = useCallback(() => {
    const gridExport = (window as unknown as Record<string, { excel: () => void; csv: () => void }>)
      .__allocationGridExport
    if (gridExport?.excel) {
      gridExport.excel()
    }
  }, [])

  const handleExportCsv = useCallback(() => {
    const gridExport = (window as unknown as Record<string, { excel: () => void; csv: () => void }>)
      .__allocationGridExport
    if (gridExport?.csv) {
      gridExport.csv()
    }
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">配賦結果VIEW</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{result?.periodLabel || '読み込み中...'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading}>
            <FileDown className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={loading}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button variant="outline" size="icon" onClick={loadResult} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-muted-foreground">配賦イベント</span>
                <div className="text-xl font-bold">{summary.eventCount}件</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">ステップ数</span>
                <div className="text-xl font-bold">{summary.stepCount}件</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">配賦明細数</span>
                <div className="text-xl font-bold">{summary.detailCount}件</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">配賦総額</span>
                <div className="text-xl font-bold font-mono">
                  ¥{summary.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">表示:</span>
              <Select value={selectedExecutionId} onValueChange={setSelectedExecutionId}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="配賦イベントを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのイベント</SelectItem>
                  {result?.executions.map((exec) => (
                    <SelectItem key={exec.executionId} value={exec.executionId}>
                      {exec.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Execution Info */}
      {filteredExecutions.length > 0 && selectedExecutionId !== 'all' && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            {filteredExecutions.map((exec) => (
              <div key={exec.executionId} className="flex items-center gap-4">
                <Badge variant={exec.status === 'SUCCESS' ? 'default' : 'destructive'}>
                  {exec.status === 'SUCCESS' ? '成功' : '失敗'}
                </Badge>
                <div className="text-sm">
                  <span className="text-muted-foreground">実行者: </span>
                  <span>{exec.executedBy}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">実行日時: </span>
                  <span>{new Date(exec.executedAt).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid */}
      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            読み込み中...
          </div>
        ) : treeNodes.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            配賦結果がありません
          </div>
        ) : (
          <AllocationResultGrid
            data={treeNodes}
            height={Math.max(400, Math.min(treeNodes.length * 40 + 100, 700))}
            companyName="EPMホールディングス"
            periodLabel={result?.periodLabel}
          />
        )}
      </Card>
    </div>
  )
}

export default AllocationResultPage
