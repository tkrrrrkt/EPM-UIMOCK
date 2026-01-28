'use client'

import { Card, CardContent } from '@/shared/ui'
import { ExternalLink, BarChart3, TrendingUp, PieChart, FileText } from 'lucide-react'
import type { ReportLinkConfig } from '@epm/contracts/bff/meetings'

interface ReportLinkPreviewProps {
  config: ReportLinkConfig
}

// Mock report links for preview
const mockReportLinks = [
  { name: '予算実績比較レポート', description: '部門別の予算対実績の詳細', icon: 'bar', url: '/report/budget-actual' },
  { name: '差異分析レポート', description: '差異の要因分析', icon: 'trend', url: '/report/variance' },
  { name: '確度別売上レポート', description: '確度別の売上見込', icon: 'pie', url: '/report/confidence' },
  { name: 'PJ採算照会', description: 'プロジェクト別の採算状況', icon: 'file', url: '/report/project' },
]

export function ReportLinkPreview({ config }: ReportLinkPreviewProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'bar':
        return <BarChart3 className="h-5 w-5 text-primary" />
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-primary" />
      case 'pie':
        return <PieChart className="h-5 w-5 text-primary" />
      default:
        return <FileText className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {mockReportLinks.map((link, index) => (
        <Card
          key={index}
          className="overflow-hidden cursor-pointer transition-colors hover:bg-muted/50"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {getIcon(link.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{link.name}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground truncate">{link.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
