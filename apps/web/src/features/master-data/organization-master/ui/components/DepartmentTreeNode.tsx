'use client'

import type React from 'react'
import { useState } from 'react'
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react'
import { Badge } from '@/shared/ui'
import type { BffDepartmentTreeNode } from '@epm/contracts/bff/organization-master'
import { getOrgUnitTypeLabel } from '../../constants/options'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DepartmentContextMenu } from './DepartmentContextMenu'

interface DepartmentTreeNodeProps {
  node: BffDepartmentTreeNode
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateChild: (node: BffDepartmentTreeNode) => void
  onEdit: (node: BffDepartmentTreeNode) => void
  onDeactivate: (node: BffDepartmentTreeNode) => void
  onReactivate: (node: BffDepartmentTreeNode) => void
  level?: number
}

export function DepartmentTreeNode({
  node,
  selectedId,
  onSelect,
  onCreateChild,
  onEdit,
  onDeactivate,
  onReactivate,
  level = 0,
}: DepartmentTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${level * 20 + 8}px`,
  }

  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
          selectedId === node.id && 'bg-accent',
          !node.isActive && 'opacity-50',
          isDragging && 'opacity-30'
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none p-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>

        {hasChildren ? (
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex h-5 w-5 items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="h-5 w-5" />
        )}

        <button
          onClick={() => onSelect(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <span className="font-mono text-xs text-muted-foreground">{node.departmentCode}</span>
          <span className="truncate font-medium">{node.departmentName}</span>
          {node.orgUnitType && (
            <Badge variant="secondary" className="text-xs">
              {getOrgUnitTypeLabel(node.orgUnitType)}
            </Badge>
          )}
        </button>
      </div>

      {isExpanded &&
        hasChildren &&
        node.children.map((child) => (
          <DepartmentContextMenu
            key={child.id}
            node={child}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onReactivate={onReactivate}
          >
            <DepartmentTreeNode
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
              level={level + 1}
            />
          </DepartmentContextMenu>
        ))}
    </div>
  )
}
