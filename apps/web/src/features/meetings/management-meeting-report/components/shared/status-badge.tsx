'use client'

import { Badge } from '@/shared/ui/components/badge'
import { cn } from '@/lib/utils'
import type { MeetingEventStatus, SubmissionStatus, KpiCardStatus } from '@epm/contracts/bff/meetings'

// Meeting Event Status colors and labels
const meetingEventStatusConfig: Record<
  MeetingEventStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: '下書き',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  OPEN: {
    label: '公開',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  COLLECTING: {
    label: '収集中',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  DISTRIBUTED: {
    label: '配信済',
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  HELD: {
    label: '開催済',
    className: 'bg-info/10 text-info border-info/20',
  },
  CLOSED: {
    label: 'クローズ',
    className: 'bg-success/10 text-success border-success/20',
  },
  ARCHIVED: {
    label: 'アーカイブ',
    className: 'bg-muted text-muted-foreground border-muted',
  },
}

// Submission Status colors and labels
const submissionStatusConfig: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  NOT_STARTED: {
    label: '未着手',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  DRAFT: {
    label: '作成中',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  SUBMITTED: {
    label: '提出済',
    className: 'bg-success/10 text-success border-success/20',
  },
}

// KPI Card Status colors and labels
const kpiCardStatusConfig: Record<
  KpiCardStatus,
  { label: string; className: string }
> = {
  SUCCESS: {
    label: '順調',
    className: 'bg-success/10 text-success border-success/20',
  },
  WARNING: {
    label: '注意',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  ERROR: {
    label: '要注意',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

interface MeetingEventStatusBadgeProps {
  status: MeetingEventStatus
  className?: string
}

export function MeetingEventStatusBadge({
  status,
  className,
}: MeetingEventStatusBadgeProps) {
  const config = meetingEventStatusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus
  className?: string
}

export function SubmissionStatusBadge({
  status,
  className,
}: SubmissionStatusBadgeProps) {
  const config = submissionStatusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

interface KpiCardStatusBadgeProps {
  status: KpiCardStatus
  className?: string
}

export function KpiCardStatusBadge({
  status,
  className,
}: KpiCardStatusBadgeProps) {
  const config = kpiCardStatusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
