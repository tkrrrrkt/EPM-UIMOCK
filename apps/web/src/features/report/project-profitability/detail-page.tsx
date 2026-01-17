'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Building2,
  Loader2,
} from 'lucide-react'
import { Button, Card } from '@/shared/ui'
import { cn } from '@/lib/utils'
import { bffClient } from './api'
import type {
  BffProjectDetailResponse,
  BffProjectMonthlyTrendResponse,
  ProjectStatus,
} from '@epm/contracts/bff/project-profitability'

interface ProjectDetailPageProps {
  projectId: string
}

const statusLabels: Record<ProjectStatus, string> = {
  PLANNED: '計画中',
  ACTIVE: '進行中',
  ON_HOLD: '保留中',
  CLOSED: '完了',
}

const statusStyles: Record<ProjectStatus, string> = {
  PLANNED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  ACTIVE: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  ON_HOLD: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  CLOSED: 'bg-muted text-muted-foreground',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ja-JP').format(value)
}

const formatCurrencyCompact = (value: number) => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}億`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`
  }
  return new Intl.NumberFormat('ja-JP').format(value)
}

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`
}

const formatVariance = (value: number) => {
  const formatted = formatCurrency(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<BffProjectDetailResponse | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<BffProjectMonthlyTrendResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detailRes, trendRes] = await Promise.all([
        bffClient.getProjectDetail(projectId),
        bffClient.getMonthlyTrend(projectId),
      ])
      setDetail(detailRes)
      setMonthlyTrend(trendRes)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setError(errorObj?.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleBack = () => {
    router.push('/report/project-profitability')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'プロジェクトが見つかりません'}</p>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            一覧に戻る
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{detail.projectName}</h1>
              {detail.isWarning && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              {detail.isProjectionNegative && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-sm font-medium">
                  赤字見込
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{detail.projectCode}</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">責任部門</span>
          </div>
          <p className="font-medium">{detail.departmentName}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="h-4 w-4" />
            <span className="text-xs">責任者</span>
          </div>
          <p className="font-medium">{detail.ownerEmployeeName || '-'}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">期間</span>
          </div>
          <p className="font-medium text-sm">
            {detail.startDate || '-'} 〜 {detail.endDate || '-'}
          </p>
        </Card>
        <Card className="p-4">
          <div className="text-muted-foreground text-xs mb-1">ステータス</div>
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium',
              statusStyles[detail.status]
            )}
          >
            {statusLabels[detail.status]}
          </span>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="売上進捗率"
          value={detail.kpis.revenueProgressRate}
          target={100}
          icon={detail.kpis.revenueProgressRate >= 50 ? TrendingUp : TrendingDown}
        />
        <KpiCard
          label="予算消化率"
          value={detail.kpis.costConsumptionRate}
          target={100}
          icon={detail.kpis.costConsumptionRate <= 100 ? TrendingUp : TrendingDown}
          inversed
        />
        <KpiCard
          label="粗利率"
          value={detail.kpis.grossProfitRate}
          target={20}
          icon={detail.kpis.grossProfitRate >= 0 ? TrendingUp : TrendingDown}
          isWarning={detail.kpis.grossProfitRate < 0}
        />
        {detail.kpis.marginalProfitRate !== null && (
          <KpiCard
            label="限界利益率"
            value={detail.kpis.marginalProfitRate}
            target={40}
            icon={detail.kpis.marginalProfitRate >= 30 ? TrendingUp : TrendingDown}
          />
        )}
      </div>

      {/* Main Metrics Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">主要指標サマリ</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">指標</th>
                <th className="p-3 text-right font-medium">予算</th>
                <th className="p-3 text-right font-medium">実績</th>
                <th className="p-3 text-right font-medium">見込</th>
                <th className="p-3 text-right font-medium">着地予測</th>
                <th className="p-3 text-right font-medium">予算差異</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label="売上高"
                budget={detail.metrics.revenueBudget}
                actual={detail.metrics.revenueActual}
                forecast={detail.metrics.revenueForecast}
                projection={detail.metrics.revenueProjection}
                variance={detail.metrics.revenueVariance}
              />
              <MetricRow
                label="売上原価"
                budget={detail.metrics.cogsBudget}
                actual={detail.metrics.cogsActual}
                forecast={detail.metrics.cogsForecast}
                projection={detail.metrics.cogsProjection}
                variance={detail.metrics.cogsVariance}
                inversed
              />
              <MetricRow
                label="粗利"
                budget={detail.metrics.grossProfitBudget}
                actual={detail.metrics.grossProfitActual}
                forecast={detail.metrics.grossProfitForecast}
                projection={detail.metrics.grossProfitProjection}
                variance={detail.metrics.grossProfitVariance}
                highlight
              />
              <MetricRow
                label="営業利益"
                budget={detail.metrics.operatingProfitBudget}
                actual={detail.metrics.operatingProfitActual}
                forecast={detail.metrics.operatingProfitForecast}
                projection={detail.metrics.operatingProfitProjection}
                variance={detail.metrics.operatingProfitVariance}
                highlight
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Direct Costing Metrics */}
      {detail.directCostingMetrics && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">直接原価計算</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">指標</th>
                  <th className="p-3 text-right font-medium">予算</th>
                  <th className="p-3 text-right font-medium">実績</th>
                  <th className="p-3 text-right font-medium">着地予測</th>
                </tr>
              </thead>
              <tbody>
                <DirectCostRow
                  label="変動費"
                  budget={detail.directCostingMetrics.variableCostBudget}
                  actual={detail.directCostingMetrics.variableCostActual}
                  projection={detail.directCostingMetrics.variableCostProjection}
                />
                <DirectCostRow
                  label="限界利益"
                  budget={detail.directCostingMetrics.marginalProfitBudget}
                  actual={detail.directCostingMetrics.marginalProfitActual}
                  projection={detail.directCostingMetrics.marginalProfitProjection}
                  highlight
                />
                <DirectCostRow
                  label="固定費"
                  budget={detail.directCostingMetrics.fixedCostBudget}
                  actual={detail.directCostingMetrics.fixedCostActual}
                  projection={detail.directCostingMetrics.fixedCostProjection}
                />
                <DirectCostRow
                  label="貢献利益"
                  budget={detail.directCostingMetrics.contributionProfitBudget}
                  actual={detail.directCostingMetrics.contributionProfitActual}
                  projection={detail.directCostingMetrics.contributionProfitProjection}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Monthly Trend */}
      {monthlyTrend && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">月別推移</h2>
          <div className="overflow-x-auto">
            <MonthlyTrendTable trend={monthlyTrend} />
          </div>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// Sub Components
// ============================================================================

function KpiCard({
  label,
  value,
  target,
  icon: Icon,
  isWarning,
  inversed,
}: {
  label: string
  value: number
  target: number
  icon: typeof TrendingUp
  isWarning?: boolean
  inversed?: boolean
}) {
  const isGood = inversed ? value <= target : value >= target * 0.8

  return (
    <Card className={cn(
      'p-4',
      isWarning && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn(
          'h-4 w-4',
          isWarning ? 'text-red-500' : isGood ? 'text-green-500' : 'text-amber-500'
        )} />
      </div>
      <p className={cn(
        'text-3xl font-bold mt-2',
        isWarning && 'text-red-600 dark:text-red-400'
      )}>
        {formatPercent(value)}
      </p>
    </Card>
  )
}

function MetricRow({
  label,
  budget,
  actual,
  forecast,
  projection,
  variance,
  highlight,
  inversed,
}: {
  label: string
  budget: number
  actual: number
  forecast: number
  projection: number
  variance: number
  highlight?: boolean
  inversed?: boolean
}) {
  const isNegativeVariance = inversed ? variance > 0 : variance < 0

  return (
    <tr className={cn('border-b', highlight && 'bg-muted/30')}>
      <td className={cn('p-3 font-medium', highlight && 'font-semibold')}>{label}</td>
      <td className="p-3 text-right font-mono">{formatCurrencyCompact(budget)}</td>
      <td className="p-3 text-right font-mono">{formatCurrencyCompact(actual)}</td>
      <td className="p-3 text-right font-mono">{formatCurrencyCompact(forecast)}</td>
      <td className="p-3 text-right font-mono font-medium">{formatCurrencyCompact(projection)}</td>
      <td className={cn(
        'p-3 text-right font-mono',
        isNegativeVariance && 'text-red-600 dark:text-red-400'
      )}>
        {formatVariance(variance)}
      </td>
    </tr>
  )
}

function DirectCostRow({
  label,
  budget,
  actual,
  projection,
  highlight,
}: {
  label: string
  budget: number
  actual: number
  projection: number
  highlight?: boolean
}) {
  return (
    <tr className={cn('border-b', highlight && 'bg-muted/30')}>
      <td className={cn('p-3 font-medium', highlight && 'font-semibold')}>{label}</td>
      <td className="p-3 text-right font-mono">{formatCurrencyCompact(budget)}</td>
      <td className="p-3 text-right font-mono">{formatCurrencyCompact(actual)}</td>
      <td className="p-3 text-right font-mono font-medium">{formatCurrencyCompact(projection)}</td>
    </tr>
  )
}

function MonthlyTrendTable({ trend }: { trend: BffProjectMonthlyTrendResponse }) {
  const formatMonth = (month: string) => {
    const [, m] = month.split('-')
    return `${parseInt(m)}月`
  }

  const metrics = [
    { label: '売上高', data: trend.revenue },
    { label: '売上原価', data: trend.cogs },
    { label: '粗利', data: trend.grossProfit },
    { label: '営業利益', data: trend.operatingProfit },
  ]

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="p-2 text-left font-medium sticky left-0 bg-muted/50 min-w-[100px]">指標</th>
          <th className="p-2 text-left font-medium min-w-[60px]">種別</th>
          {trend.months.map((month) => (
            <th key={month} className="p-2 text-right font-medium min-w-[80px]">
              {formatMonth(month)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metrics.map((metric, idx) => (
          <>
            <tr key={`${metric.label}-budget`} className={cn(idx > 0 && 'border-t')}>
              <td rowSpan={3} className="p-2 font-medium sticky left-0 bg-background border-r align-middle">
                {metric.label}
              </td>
              <td className="p-2 text-muted-foreground">予算</td>
              {metric.data.budget.map((val, i) => (
                <td key={i} className="p-2 text-right font-mono">
                  {formatCurrencyCompact(val)}
                </td>
              ))}
            </tr>
            <tr key={`${metric.label}-actual`}>
              <td className="p-2 text-muted-foreground">実績</td>
              {metric.data.actual.map((val, i) => (
                <td key={i} className="p-2 text-right font-mono">
                  {val > 0 ? formatCurrencyCompact(val) : <span className="text-muted-foreground">-</span>}
                </td>
              ))}
            </tr>
            <tr key={`${metric.label}-forecast`} className="border-b">
              <td className="p-2 text-muted-foreground">見込</td>
              {metric.data.forecast.map((val, i) => (
                <td key={i} className="p-2 text-right font-mono">
                  {val > 0 ? formatCurrencyCompact(val) : <span className="text-muted-foreground">-</span>}
                </td>
              ))}
            </tr>
          </>
        ))}
      </tbody>
    </table>
  )
}
