'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Badge, Button } from '@/shared/ui'
import { ChevronRight, ChevronDown, FileText, Plus, GripVertical } from 'lucide-react'
import type { ReportPageDto } from '../types'

interface PageItemProps {
  page: ReportPageDto
  layoutId: string
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggle: () => void
  onAddComponent: () => void
  isDragging?: boolean
}

export function PageItem({
  page,
  layoutId,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  onAddComponent,
}: PageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: page.id,
    data: {
      type: 'page',
      parentId: layoutId,
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
        !page.isActive && 'opacity-50',
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
        onClick={onToggle}
        className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-2 overflow-hidden text-left"
      >
        <FileText className="h-4 w-4 shrink-0 text-secondary" />
        <span className="truncate">{page.pageName}</span>
        <Badge variant="outline" className="ml-auto shrink-0 text-xs">
          {page.componentCount}
        </Badge>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onAddComponent()
        }}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">コンポーネント追加</span>
      </Button>
    </div>
  )
}
