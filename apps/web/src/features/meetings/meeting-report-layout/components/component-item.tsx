'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui'
import {
  GripVertical,
  BarChart3,
  Table2,
  LayoutGrid,
  Link,
  ListChecks,
  GitCompare,
  Gauge,
  Target,
  FileInput,
} from 'lucide-react'
import type { ReportComponentDto, ReportComponentType } from '../types'

const componentTypeIcons: Record<ReportComponentType, React.ReactNode> = {
  KPI_CARD: <LayoutGrid className="h-4 w-4" />,
  TABLE: <Table2 className="h-4 w-4" />,
  CHART: <BarChart3 className="h-4 w-4" />,
  SUBMISSION_DISPLAY: <FileInput className="h-4 w-4" />,
  REPORT_LINK: <Link className="h-4 w-4" />,
  ACTION_LIST: <ListChecks className="h-4 w-4" />,
  SNAPSHOT_COMPARE: <GitCompare className="h-4 w-4" />,
  KPI_DASHBOARD: <Gauge className="h-4 w-4" />,
  AP_PROGRESS: <Target className="h-4 w-4" />,
}

const componentTypeLabels: Record<ReportComponentType, string> = {
  KPI_CARD: 'KPI',
  TABLE: '表',
  CHART: 'グラフ',
  SUBMISSION_DISPLAY: '報告',
  REPORT_LINK: 'リンク',
  ACTION_LIST: 'アクション',
  SNAPSHOT_COMPARE: '比較',
  KPI_DASHBOARD: 'ダッシュ',
  AP_PROGRESS: 'AP進捗',
}

interface ComponentItemProps {
  component: ReportComponentDto
  pageId: string
  isSelected: boolean
  onSelect: () => void
  isDragging?: boolean
}

export function ComponentItem({ component, pageId, isSelected, onSelect }: ComponentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: 'component',
      parentId: pageId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors',
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground',
        !component.isActive && 'opacity-50',
        isSortableDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        type="button"
        className="flex h-5 w-5 cursor-grab items-center justify-center rounded hover:bg-accent active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-2 overflow-hidden text-left"
      >
        <span className="text-muted-foreground">{componentTypeIcons[component.componentType]}</span>
        <span className="truncate">{component.componentName}</span>
        <Badge variant="outline" className="ml-auto shrink-0 text-xs">
          {componentTypeLabels[component.componentType]}
        </Badge>
      </button>
    </div>
  )
}
