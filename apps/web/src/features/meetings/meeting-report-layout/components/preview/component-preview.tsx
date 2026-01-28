'use client'

import type { ReportComponentDto } from '@epm/contracts/bff/meetings'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { cn } from '@/lib/utils'
import {
  KpiCardPreview,
  TablePreview,
  ChartPreview,
  SubmissionDisplayPreview,
  ReportLinkPreview,
  ActionListPreview,
  SnapshotComparePreview,
  KpiDashboardPreview,
  ApProgressPreview,
} from './component-previews'

interface ComponentPreviewProps {
  component: ReportComponentDto
}

export function ComponentPreview({ component }: ComponentPreviewProps) {
  const renderComponent = () => {
    switch (component.componentType) {
      case 'KPI_CARD':
        return <KpiCardPreview config={component.configJson as any} />

      case 'TABLE':
        return <TablePreview config={component.configJson as any} />

      case 'CHART':
        return <ChartPreview config={component.configJson as any} />

      case 'SUBMISSION_DISPLAY':
        return <SubmissionDisplayPreview config={component.configJson as any} />

      case 'REPORT_LINK':
        return <ReportLinkPreview config={component.configJson as any} />

      case 'ACTION_LIST':
        return <ActionListPreview config={component.configJson as any} />

      case 'SNAPSHOT_COMPARE':
        return <SnapshotComparePreview config={component.configJson as any} />

      case 'KPI_DASHBOARD':
        return <KpiDashboardPreview config={component.configJson as any} />

      case 'AP_PROGRESS':
        return <ApProgressPreview config={component.configJson as any} />

      default:
        return (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            未対応のコンポーネントタイプ: {component.componentType}
          </div>
        )
    }
  }

  const getWidthClass = () => {
    switch (component.width) {
      case 'FULL':
        return 'col-span-12'
      case 'HALF':
        return 'col-span-6'
      case 'THIRD':
        return 'col-span-4'
      default:
        return 'col-span-12'
    }
  }

  return (
    <div className={cn(getWidthClass())}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{component.componentName}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderComponent()}
        </CardContent>
      </Card>
    </div>
  )
}
