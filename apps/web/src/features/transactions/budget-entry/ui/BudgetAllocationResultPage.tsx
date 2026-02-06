'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileSpreadsheet, FileDown, RefreshCw, Calculator } from 'lucide-react'
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
import { MockBffClient } from '../api/mock-bff-client'
import type {
  BffBudgetAllocationResultResponse,
  BffBudgetAllocationExecution,
  BffBudgetAllocationTreeNode,
} from '@epm/contracts/bff/budget-entry'

const bffClient = new MockBffClient()

interface BudgetAllocationResultPageProps {
  planEventId: string
}

/**
 * 配賦結果をツリーノード形式に変換
 */
function convertToTreeNodes(executions: BffBudgetAllocationExecution[]): BffBudgetAllocationTreeNode[] {
  const nodes: BffBudgetAllocationTreeNode[] = []

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

function formatNumber(value: number): string {
  return value.toLocaleString()
}

export function BudgetAllocationResultPage({
  planEventId,
}: BudgetAllocationResultPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BffBudgetAllocationResultResponse | null>(null)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>('all')

  const loadResult = useCallback(async () => {
    setLoading(true)
    try {
      const response = await bffClient.getAllocationResult(planEventId)
      setResult(response)

      if (response.executions.length === 0) {
        toast({
          title: '配賦結果なし',
          description: 'このイベントの配賦結果はありません',
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
  }, [planEventId, toast])

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

  const handleBack = () => {
    router.push('/transactions/budget-entry')
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">配賦結果VIEW</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calculator className="h-4 w-4" />
              <span>{result?.planEventName || '読み込み中...'}</span>
              {result && (
                <Badge variant="outline" className="ml-2">
                  {result.planVersionName}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                  ¥{formatNumber(summary.totalAmount)}
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

      {/* Simple Table View (AG-Grid can be added later) */}
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
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="text-left p-2 font-medium">配賦内容</th>
                  <th className="text-left p-2 font-medium">配賦元科目</th>
                  <th className="text-left p-2 font-medium">配賦元部門</th>
                  <th className="text-left p-2 font-medium">配賦先</th>
                  <th className="text-left p-2 font-medium">配賦先科目</th>
                  <th className="text-left p-2 font-medium">ドライバ</th>
                  <th className="text-right p-2 font-medium">比率</th>
                  <th className="text-right p-2 font-medium">金額</th>
                </tr>
              </thead>
              <tbody>
                {treeNodes.map((node) => (
                  <tr
                    key={node.id}
                    className={`border-b ${
                      node.nodeType === 'EVENT'
                        ? 'bg-muted/50 font-bold'
                        : node.nodeType === 'STEP'
                          ? 'bg-muted/20 font-medium'
                          : ''
                    }`}
                  >
                    <td className="p-2" style={{ paddingLeft: `${(node.orgHierarchy.length - 1) * 20 + 8}px` }}>
                      {node.nodeType === 'EVENT'
                        ? node.eventName
                        : node.nodeType === 'STEP'
                          ? node.stepName
                          : node.targetName}
                    </td>
                    <td className="p-2">{node.fromSubject || ''}</td>
                    <td className="p-2">{node.fromDepartment || ''}</td>
                    <td className="p-2">{node.nodeType === 'DETAIL' ? node.targetName : ''}</td>
                    <td className="p-2">{node.toSubject || ''}</td>
                    <td className="p-2">
                      {node.driverType
                        ? { FIXED: '固定比率', HEADCOUNT: '人数', SUBJECT_AMOUNT: '科目金額', KPI: 'KPI値' }[
                            node.driverType
                          ] || node.driverType
                        : ''}
                    </td>
                    <td className="p-2 text-right">
                      {node.ratio != null ? `${(node.ratio * 100).toFixed(2)}%` : ''}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {node.amount != null ? `¥${formatNumber(node.amount)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default BudgetAllocationResultPage
