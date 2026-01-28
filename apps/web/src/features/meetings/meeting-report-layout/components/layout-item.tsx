'use client'

import { cn } from '@/lib/utils'
import { Badge, Button } from '@/shared/ui'
import { ChevronRight, ChevronDown, LayoutTemplate, Plus, Star } from 'lucide-react'
import type { ReportLayoutDto } from '../types'

interface LayoutItemProps {
  layout: ReportLayoutDto
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggle: () => void
  onAddPage: () => void
}

export function LayoutItem({
  layout,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  onAddPage,
}: LayoutItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors',
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground',
        !layout.isActive && 'opacity-50'
      )}
    >
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
        <LayoutTemplate className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate font-medium">{layout.layoutName}</span>
        {layout.isDefault && <Star className="h-3 w-3 shrink-0 fill-primary text-primary" />}
        <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
          {layout.pageCount}
        </Badge>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onAddPage()
        }}
      >
        <Plus className="h-3 w-3" />
        <span className="sr-only">ページ追加</span>
      </Button>
    </div>
  )
}
