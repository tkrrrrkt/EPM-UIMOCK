'use client'

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LayoutDashboard,
  Building2,
  Settings,
  Calendar,
  Clock,
  MoreHorizontal,
  Play,
  Send,
  Archive,
  ClipboardList,
  Lock,
  ScrollText,
  Target,
  BarChart3,
  GitCompare,
} from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/tabs'
import { Skeleton } from '@/shared/ui/components/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/components/dropdown-menu'
import { MeetingEventStatusBadge } from '../shared/status-badge'
import { SummaryDashboard } from './summary-dashboard'
import { DepartmentReportsTab } from './department-reports-tab'
import type { BffClient } from '../../api/bff-client'
import type { MeetingEventDto, MeetingEventStatus } from '@epm/contracts/bff/meetings'

// Lazy load report dashboards for embedded display
const ReportsDashboard = lazy(() =>
  import('@/features/report/budget-actual-report').then((m) => ({ default: m.ReportsDashboard }))
)
const VarianceAnalysisDashboard = lazy(() =>
  import('@/features/report/variance-report').then((m) => ({ default: m.VarianceAnalysisDashboard }))
)
const ConfidenceReportDashboard = lazy(() =>
  import('@/features/report/confidence-report').then((m) => ({ default: m.ConfidenceReportDashboard }))
)
const BudgetTrendDashboard = lazy(() =>
  import('@/features/report/budget-trend-report').then((m) => ({ default: m.BudgetTrendDashboard }))
)

// Lazy load KPI list and minutes form for embedded display
const KpiListPage = lazy(() =>
  import('@/features/kpi/kpi-master/components/kpi-list-page').then((m) => ({ default: m.KpiListPage }))
)
const MinutesFormPage = lazy(() =>
  import('../../components/minutes/minutes-form-page').then((m) => ({ default: m.MinutesFormPage }))
)

// Loading fallback component for lazy-loaded reports
function ReportLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">レポートを読み込み中...</p>
      </div>
    </div>
  )
}

interface ReportMainPageProps {
  client: BffClient
  eventId: string
}

export function ReportMainPage({ client, eventId }: ReportMainPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<MeetingEventDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')

  const fetchEvent = useCallback(async () => {
    setLoading(true)
    try {
      const eventData = await client.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Failed to fetch event:', error)
    } finally {
      setLoading(false)
    }
  }, [client, eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const handleBack = () => {
    router.push('/meetings/management-meeting-report')
  }

  const handleStatusChange = async (newStatus: MeetingEventStatus) => {
    try {
      await client.updateEventStatus(eventId, { status: newStatus })
      fetchEvent()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get available status transitions
  const getStatusActions = (currentStatus: MeetingEventStatus) => {
    const transitions: Record<MeetingEventStatus, { status: MeetingEventStatus; label: string; icon: typeof Play }[]> = {
      DRAFT: [{ status: 'OPEN', label: '公開する', icon: Play }],
      OPEN: [{ status: 'COLLECTING', label: '収集開始', icon: Send }],
      COLLECTING: [{ status: 'DISTRIBUTED', label: '配信完了', icon: Send }],
      DISTRIBUTED: [{ status: 'HELD', label: '開催完了', icon: Play }],
      HELD: [{ status: 'CLOSED', label: 'クローズ', icon: Archive }],
      CLOSED: [{ status: 'ARCHIVED', label: 'アーカイブ', icon: Archive }],
      ARCHIVED: [],
    }
    return transitions[currentStatus] || []
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-medium text-muted-foreground">
          イベントが見つかりません
        </p>
        <Button variant="outline" className="mt-4" onClick={handleBack}>
          一覧に戻る
        </Button>
      </div>
    )
  }

  const statusActions = getStatusActions(event.status)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{event.eventName}</h1>
                <MeetingEventStatusBadge status={event.status} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">{event.eventCode}</span>
                <span>•</span>
                <span>{event.meetingTypeName}</span>
                {event.targetPeriodName && (
                  <>
                    <span>•</span>
                    <span>{event.targetPeriodName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Management Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  管理
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/meetings/management-meeting-report/${eventId}/tracking`)}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  登録状況管理
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/meetings/management-meeting-report/${eventId}/minutes`)}
                >
                  <ScrollText className="h-4 w-4 mr-2" />
                  議事録登録
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/meetings/management-meeting-report/${eventId}/close`)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  会議クローズ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Actions */}
            {statusActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    ステータス変更
                    <MoreHorizontal className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusActions.map((action) => (
                    <DropdownMenuItem
                      key={action.status}
                      onClick={() => handleStatusChange(action.status)}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Event Info Bar */}
      <div className="px-6 py-3 bg-muted/30 border-b">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">提出期限:</span>
            <span className="font-medium">{formatDateTime(event.submissionDeadline)}</span>
          </div>
          {event.distributionDate && (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">配信日:</span>
              <span className="font-medium">{formatDate(event.distributionDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">会議日:</span>
            <span className="font-medium">{formatDateTime(event.meetingDate)}</span>
          </div>
        </div>
      </div>

      {/*
        Fixed Tab Structure for Meeting Reports (Architectural Decision: SIMPLIFIED_LAYOUT_SYSTEM)

        タブは FIXED かつ HARDCODED であり、データベースレイアウトページにより駆動されていません。

        各タブの役割：
        - サマリー: レポートレイアウト設定から定義されたダッシュボードコンポーネント（configurable）
        - 部門報告: 報告フォーム設定のセクション/フィールド構造を使用（fixed display）
        - KPI・AP: kpi-master フィーチャーに組込まれたKPI表示（fixed display）
        - 詳細分析: 既存レポートリンク（fixed display）
        - 前回比較: Phase 3で実装予定（currently placeholder）
        - 議事録: 報告フォーム設定のフォーム構造を使用（fixed form）

        参照: .kiro/specs/meetings/meeting-report-layout/ARCHITECTURE_DECISION.md
      */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 border-b bg-background shrink-0">
            <TabsList className="h-12">
              <TabsTrigger value="summary" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                サマリー
              </TabsTrigger>
              <TabsTrigger value="departments" className="gap-2">
                <Building2 className="h-4 w-4" />
                部門報告
              </TabsTrigger>
              <TabsTrigger value="kpi-actions" className="gap-2">
                <Target className="h-4 w-4" />
                KPI・AP
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                詳細分析
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2">
                <GitCompare className="h-4 w-4" />
                前回比較
              </TabsTrigger>
              <TabsTrigger value="minutes" className="gap-2">
                <ScrollText className="h-4 w-4" />
                議事録
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto min-h-0">
            {/* D2: サマリー */}
            <TabsContent value="summary" className="m-0 mt-0 data-[state=active]:block">
              <SummaryDashboard client={client} eventId={eventId} />
            </TabsContent>

            {/* D4: 部門報告 */}
            <TabsContent value="departments" className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <DepartmentReportsTab client={client} eventId={eventId} />
            </TabsContent>

            {/* D5: KPI・アクション */}
            <TabsContent value="kpi-actions" className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <Suspense fallback={<ReportLoadingFallback />}>
                <div className="h-full overflow-auto">
                  <KpiListPage />
                </div>
              </Suspense>
            </TabsContent>

            {/* D3: 詳細分析 - サブタブ切替式 */}
            <TabsContent value="analysis" className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <Tabs defaultValue="budget-actual" className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-3 border-b bg-muted/30 shrink-0">
                  <TabsList className="h-9">
                    <TabsTrigger value="budget-actual" className="text-sm">
                      予算実績照会
                    </TabsTrigger>
                    <TabsTrigger value="variance" className="text-sm">
                      差異分析
                    </TabsTrigger>
                    <TabsTrigger value="confidence" className="text-sm">
                      確度別売上見込
                    </TabsTrigger>
                    <TabsTrigger value="consumption" className="text-sm">
                      予算消化推移
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="budget-actual" className="flex-1 m-0 min-h-0 overflow-hidden">
                  <Suspense fallback={<ReportLoadingFallback />}>
                    <div className="h-full">
                      <ReportsDashboard />
                    </div>
                  </Suspense>
                </TabsContent>

                <TabsContent value="variance" className="flex-1 m-0 min-h-0 overflow-hidden">
                  <Suspense fallback={<ReportLoadingFallback />}>
                    <div className="h-full">
                      <VarianceAnalysisDashboard />
                    </div>
                  </Suspense>
                </TabsContent>

                <TabsContent value="confidence" className="flex-1 m-0 min-h-0 overflow-hidden">
                  <Suspense fallback={<ReportLoadingFallback />}>
                    <div className="h-full">
                      <ConfidenceReportDashboard />
                    </div>
                  </Suspense>
                </TabsContent>

                <TabsContent value="consumption" className="flex-1 m-0 min-h-0 overflow-hidden">
                  <Suspense fallback={<ReportLoadingFallback />}>
                    <div className="h-full">
                      <BudgetTrendDashboard />
                    </div>
                  </Suspense>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* D7: 前回比較 */}
            <TabsContent value="comparison" className="m-0 p-6">
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <GitCompare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  前回比較
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  前回会議とのスナップショット比較を表示します
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Phase 3で実装予定
                </p>
              </div>
            </TabsContent>

            {/* D8: 議事録 */}
            <TabsContent value="minutes" className="m-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
              <Suspense fallback={<ReportLoadingFallback />}>
                <div className="h-full overflow-auto">
                  <MinutesFormPage
                    bffClient={client}
                    eventId={eventId}
                    onBack={handleBack}
                  />
                </div>
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
