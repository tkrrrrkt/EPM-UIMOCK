'use client'

import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@/shared/ui'
import { Target, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApProgressConfig } from '@epm/contracts/bff/meetings'

interface ApProgressPreviewProps {
  config: ApProgressConfig
}

// Mock action plan progress data for preview
const mockActionPlans = [
  {
    kpiName: '売上高',
    plans: [
      { name: '新規顧客開拓プラン', progress: 75, status: 'IN_PROGRESS' as const, tasks: { total: 8, completed: 6 } },
      { name: '既存顧客深耕プラン', progress: 90, status: 'IN_PROGRESS' as const, tasks: { total: 5, completed: 4 } },
    ],
  },
  {
    kpiName: '営業利益率',
    plans: [
      { name: 'コスト削減イニシアチブ', progress: 40, status: 'DELAYED' as const, tasks: { total: 10, completed: 4 } },
    ],
  },
  {
    kpiName: '顧客満足度',
    plans: [
      { name: 'CS向上プログラム', progress: 100, status: 'COMPLETED' as const, tasks: { total: 6, completed: 6 } },
    ],
  },
]

export function ApProgressPreview({ config }: ApProgressPreviewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'DELAYED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">完了</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">進行中</Badge>
      case 'DELAYED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">遅延</Badge>
      default:
        return <Badge variant="secondary">未着手</Badge>
    }
  }

  // Filter based on config if specified
  const filteredPlans = config.filterByStatus
    ? mockActionPlans.map((kpiGroup) => ({
        ...kpiGroup,
        plans: kpiGroup.plans.filter((plan) => config.filterByStatus?.includes(plan.status)),
      })).filter((kpiGroup) => kpiGroup.plans.length > 0)
    : mockActionPlans

  if (config.showKanban) {
    // Kanban view
    const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'DELAYED', 'COMPLETED']
    const allPlans = filteredPlans.flatMap((kpiGroup) =>
      kpiGroup.plans.map((plan) => ({ ...plan, kpiName: kpiGroup.kpiName }))
    )

    return (
      <div className="grid grid-cols-4 gap-4">
        {statuses.map((status) => {
          const statusPlans = allPlans.filter((p) => p.status === status)
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {status === 'NOT_STARTED' && '未着手'}
                  {status === 'IN_PROGRESS' && '進行中'}
                  {status === 'DELAYED' && '遅延'}
                  {status === 'COMPLETED' && '完了'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {statusPlans.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[100px] rounded-lg bg-muted/30 p-2">
                {statusPlans.map((plan, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{plan.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {plan.kpiName}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // List view (grouped by KPI)
  return (
    <div className="space-y-6">
      {filteredPlans.map((kpiGroup, groupIndex) => (
        <div key={groupIndex}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-medium">{kpiGroup.kpiName}</h3>
          </div>
          <div className="space-y-3">
            {kpiGroup.plans.map((plan, planIndex) => (
              <Card key={planIndex}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(plan.status)}
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      {config.showProgress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>進捗</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-2" />
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        タスク: {plan.tasks.completed}/{plan.tasks.total} 完了
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(plan.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
