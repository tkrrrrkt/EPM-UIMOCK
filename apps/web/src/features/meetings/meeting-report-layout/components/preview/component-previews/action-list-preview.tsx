'use client'

import { Card, CardContent, Badge } from '@/shared/ui'
import { Calendar, User, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionListConfig } from '@epm/contracts/bff/meetings'

interface ActionListPreviewProps {
  config: ActionListConfig
}

// Valid status type matching ActionListConfig
type ActionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// Mock action items for preview
const mockActionItems: {
  title: string
  assignee: string
  dueDate: string
  status: ActionStatus
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  kpiName: string
  isOverdue?: boolean
}[] = [
  {
    title: '新規顧客向け提案資料の作成',
    assignee: '山田太郎',
    dueDate: '2024-02-15',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    kpiName: '売上高',
  },
  {
    title: 'コスト削減施策の検討',
    assignee: '鈴木花子',
    dueDate: '2024-02-20',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    kpiName: '営業利益率',
  },
  {
    title: '顧客満足度調査の実施',
    assignee: '佐藤一郎',
    dueDate: '2024-02-10',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    kpiName: 'NPS',
    isOverdue: true,
  },
  {
    title: '新入社員研修計画策定',
    assignee: '田中二郎',
    dueDate: '2024-02-28',
    status: 'COMPLETED',
    priority: 'LOW',
    kpiName: '人材育成',
  },
]

export function ActionListPreview({ config }: ActionListPreviewProps) {
  const getStatusBadge = (status: ActionStatus, isOverdue?: boolean) => {
    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          期限超過
        </Badge>
      )
    }
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" className="bg-emerald-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            完了
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            進行中
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            キャンセル
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            未着手
          </Badge>
        )
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <div className="w-1 h-full bg-red-500 rounded-l" />
      case 'MEDIUM':
        return <div className="w-1 h-full bg-yellow-500 rounded-l" />
      default:
        return <div className="w-1 h-full bg-gray-300 rounded-l" />
    }
  }

  // Filter based on config if specified
  const filteredItems = config.filterStatus
    ? mockActionItems.filter((item) => config.filterStatus?.includes(item.status))
    : mockActionItems

  return (
    <div className="space-y-3">
      {filteredItems.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="flex">
            {getPriorityIndicator(item.priority)}
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.dueDate}
                    </span>
                    {item.kpiName && (
                      <Badge variant="outline" className="text-xs">
                        {item.kpiName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(item.status, item.isOverdue)}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}
