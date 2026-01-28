'use client'

import type { FormFieldType } from '../../api/bff-client'
import {
  Type,
  AlignLeft,
  Hash,
  ChevronDown,
  CheckSquare,
  Calendar,
  Paperclip,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/shared/ui'
import { cn } from '@/lib/utils'

interface FieldTypeConfig {
  label: string
  icon: LucideIcon
  className: string
}

const FIELD_TYPE_CONFIG: Record<FormFieldType, FieldTypeConfig> = {
  TEXT: {
    label: 'テキスト',
    icon: Type,
    className: 'bg-muted text-muted-foreground',
  },
  TEXTAREA: {
    label: '長文',
    icon: AlignLeft,
    className: 'bg-muted text-muted-foreground',
  },
  NUMBER: {
    label: '数値',
    icon: Hash,
    className: 'bg-blue-100 text-blue-700',
  },
  SELECT: {
    label: '単一選択',
    icon: ChevronDown,
    className: 'bg-primary/10 text-primary',
  },
  MULTI_SELECT: {
    label: '複数選択',
    icon: CheckSquare,
    className: 'bg-primary/10 text-primary',
  },
  DATE: {
    label: '日付',
    icon: Calendar,
    className: 'bg-secondary/10 text-secondary',
  },
  FILE: {
    label: 'ファイル',
    icon: Paperclip,
    className: 'bg-amber-100 text-amber-700',
  },
  FORECAST_QUOTE: {
    label: '見込引用',
    icon: Quote,
    className: 'bg-emerald-100 text-emerald-700',
  },
}

interface FieldTypeBadgeProps {
  type: FormFieldType
  className?: string
}

export function FieldTypeBadge({ type, className }: FieldTypeBadgeProps) {
  const config = FIELD_TYPE_CONFIG[type]
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={cn('gap-1 font-normal', config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export { FIELD_TYPE_CONFIG }
