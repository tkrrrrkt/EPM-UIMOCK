'use client'

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui'
import { ChevronRight, FileText, Building2 } from 'lucide-react'
import type { SubmissionDisplayConfig } from '@epm/contracts/bff/meetings'

interface SubmissionDisplayPreviewProps {
  config: SubmissionDisplayConfig
}

// Mock submission data for preview
const mockSubmissions = [
  {
    department: '営業部',
    status: '提出済',
    content: '当月の売上は目標を上回り、新規顧客の獲得が好調でした。',
    children: [
      { department: '営業1課', status: '提出済', content: '大型案件を2件受注。' },
      { department: '営業2課', status: '提出済', content: '既存顧客からのリピート増加。' },
    ],
  },
  {
    department: '開発部',
    status: '提出済',
    content: '新製品開発は予定通り進捗。一部の機能追加は来月以降に延期。',
    children: [],
  },
  {
    department: '管理部',
    status: '下書き',
    content: '',
    children: [],
  },
]

export function SubmissionDisplayPreview({ config }: SubmissionDisplayPreviewProps) {
  const displayMode = config.displayMode || 'tree'

  if (displayMode === 'card') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {mockSubmissions.map((submission, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">{submission.department}</CardTitle>
                </div>
                {config.showSubmissionStatus && (
                  <Badge
                    variant={submission.status === '提出済' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {submission.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {submission.content ? (
                <p className="text-sm text-foreground">{submission.content}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">内容なし</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Tree display mode
  return (
    <div className="rounded-md border">
      {mockSubmissions.map((submission, index) => (
        <div key={index} className="border-b last:border-b-0">
          <div className="flex items-center gap-3 p-4">
            {config.showOrganizationHierarchy && submission.children.length > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{submission.department}</span>
                {config.showSubmissionStatus && (
                  <Badge
                    variant={submission.status === '提出済' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {submission.status}
                  </Badge>
                )}
              </div>
              {submission.content && (
                <p className="mt-1 text-sm text-muted-foreground">{submission.content}</p>
              )}
            </div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Children (if hierarchy is shown and expanded) */}
          {config.showOrganizationHierarchy &&
            config.expandByDefault &&
            submission.children.map((child, childIndex) => (
              <div key={childIndex} className="flex items-center gap-3 p-4 pl-10 bg-muted/20 border-t">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{child.department}</span>
                    {config.showSubmissionStatus && (
                      <Badge
                        variant={child.status === '提出済' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {child.status}
                      </Badge>
                    )}
                  </div>
                  {child.content && (
                    <p className="mt-1 text-xs text-muted-foreground">{child.content}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
