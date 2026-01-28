'use client'

import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@/shared/ui'
import { Settings, Search, Filter } from 'lucide-react'
import { KpiSummaryCards } from './kpi-summary-cards'
import { KpiTreeView } from './kpi-tree-view'
import { KpiDetailPanel } from './kpi-detail-panel'
import { AddPeriodDialog } from './dialogs/add-period-dialog'
import { AddActionPlanDialog } from './dialogs/add-action-plan-dialog'
import { getBffClient } from '../api/client'
import type {
  BffKpiListResponse,
  BffKpiDetail,
  BffKpiEvent,
  BffDepartment,
  BffEmployee,
} from '../lib/types'
import { cn } from '@/lib/utils'

interface KpiListPageProps {
  onNavigateToMaster?: () => void
}

export function KpiListPage({ onNavigateToMaster }: KpiListPageProps) {
  const client = getBffClient()

  const [events, setEvents] = useState<BffKpiEvent[]>([])
  const [departments, setDepartments] = useState<BffDepartment[]>([])
  const [employees, setEmployees] = useState<BffEmployee[]>([])
  const [kpiListResponse, setKpiListResponse] = useState<BffKpiListResponse | null>(null)

  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null)
  const [kpiDetail, setKpiDetail] = useState<BffKpiDetail | null>(null)

  // Dialog states
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false)
  const [isAddActionPlanOpen, setIsAddActionPlanOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [eventsData, deptsData, empsData] = await Promise.all([
        client.getEvents(),
        client.getDepartments(),
        client.getEmployees(),
      ])
      setEvents(eventsData)
      setDepartments(deptsData)
      setEmployees(empsData)
      if (eventsData.length > 0) {
        setSelectedEventId(eventsData[0].id)
      }
    }
    loadData()
  }, [client])

  // Load KPI list when event changes
  useEffect(() => {
    if (selectedEventId) {
      const loadKpiList = async () => {
        const deptIds = selectedDepartment !== 'all' ? [selectedDepartment] : undefined
        const data = await client.getKpiList(selectedEventId, deptIds)
        setKpiListResponse(data)
      }
      loadKpiList()
    }
  }, [client, selectedEventId, selectedDepartment])

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const handleSelectKpi = async (kpiId: string) => {
    if (selectedKpiId === kpiId) {
      setSelectedKpiId(null)
      setKpiDetail(null)
    } else {
      setSelectedKpiId(kpiId)
      const detail = await client.getKpiDetail(kpiId)
      setKpiDetail(detail)
    }
  }

  const handleCloseDetail = () => {
    setSelectedKpiId(null)
    setKpiDetail(null)
  }

  const handleAddPeriod = async (periodCode: string, targetValue?: number) => {
    if (selectedKpiId) {
      await client.createPeriod(selectedKpiId, periodCode, targetValue)
      // Refresh detail
      const detail = await client.getKpiDetail(selectedKpiId)
      setKpiDetail(detail)
    }
    setIsAddPeriodOpen(false)
  }

  const handleAddActionPlan = async (data: {
    planName: string
    departmentStableId?: string
    ownerEmployeeId?: string
    dueDate?: string
  }) => {
    if (selectedKpiId) {
      await client.createActionPlan({
        kpiMasterItemId: selectedKpiId,
        ...data,
      })
      // Refresh detail
      const detail = await client.getKpiDetail(selectedKpiId)
      setKpiDetail(detail)
    }
    setIsAddActionPlanOpen(false)
  }

  const handleUpdateFactAmount = async (
    factId: string,
    target?: number,
    actual?: number
  ) => {
    await client.updateFactAmount(factId, target, actual)
    // Refresh detail
    if (selectedKpiId) {
      const detail = await client.getKpiDetail(selectedKpiId)
      setKpiDetail(detail)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            KPI状況照会
          </h1>
          {onNavigateToMaster && (
            <Button variant="outline" onClick={onNavigateToMaster}>
              <Settings className="mr-2 h-4 w-4" />
              KPI管理設定
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 border-border/50 bg-card">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">フィルタ</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-filter" className="text-xs text-muted-foreground">
                  イベント
                </Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger id="event-filter" className="w-56">
                    <SelectValue placeholder="イベントを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.eventCode} - {event.eventName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dept-filter" className="text-xs text-muted-foreground">
                  部門
                </Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger id="dept-filter" className="w-40">
                    <SelectValue placeholder="全部門" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部門</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.stableId} value={dept.stableId}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedEvent && (
                <div className="ml-auto flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded px-2 py-1 text-xs font-medium',
                      selectedEvent.status === 'CONFIRMED'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    )}
                  >
                    {selectedEvent.status === 'CONFIRMED' ? '確定' : '下書き'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {kpiListResponse && (
          <div className="mb-6">
            <KpiSummaryCards
              totalKpis={kpiListResponse.summary.totalKpis}
              overallAchievementRate={kpiListResponse.summary.overallAchievementRate}
              delayedActionPlans={kpiListResponse.summary.delayedActionPlans}
              attentionRequired={kpiListResponse.summary.attentionRequired}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* KPI Tree */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  KPI階層ツリー
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {kpiListResponse && (
                <KpiTreeView
                  kpiTree={kpiListResponse.kpiTree}
                  onSelectKpi={handleSelectKpi}
                  selectedKpiId={selectedKpiId ?? undefined}
                />
              )}
            </CardContent>
          </Card>

          {/* KPI Detail Panel */}
          {kpiDetail && (
            <KpiDetailPanel
              kpiDetail={kpiDetail}
              onClose={handleCloseDetail}
              onAddPeriod={() => setIsAddPeriodOpen(true)}
              onAddActionPlan={() => setIsAddActionPlanOpen(true)}
              onUpdateFactAmount={handleUpdateFactAmount}
            />
          )}
        </div>

        {/* Dialogs */}
        <AddPeriodDialog
          open={isAddPeriodOpen}
          onOpenChange={setIsAddPeriodOpen}
          onSubmit={handleAddPeriod}
        />
        <AddActionPlanDialog
          open={isAddActionPlanOpen}
          onOpenChange={setIsAddActionPlanOpen}
          onSubmit={handleAddActionPlan}
          departments={departments}
          employees={employees}
        />
      </div>
    </div>
  )
}
