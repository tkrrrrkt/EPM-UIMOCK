'use client'

import { ChevronRight, ChevronDown, Star } from 'lucide-react'
import { Badge } from '@/shared/ui'
import { useState } from 'react'
import type { BffGroupSubjectSelectTreeNode } from '@epm/contracts/bff/group-subject-mapping'

interface GroupSubjectSelectTreeProps {
  nodes: BffGroupSubjectSelectTreeNode[]
  selectedId: string | null
  onSelect: (node: BffGroupSubjectSelectTreeNode) => void
}

function TreeNode({
  node,
  selectedId,
  onSelect,
  level = 0,
}: {
  node: BffGroupSubjectSelectTreeNode
  selectedId: string | null
  onSelect: (node: BffGroupSubjectSelectTreeNode) => void
  level?: number
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        onClick={() => onSelect(node)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-accent/50 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-5" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono">{node.groupSubjectCode}</code>
            <span className="text-sm font-medium truncate">{node.groupSubjectName}</span>
            {node.isRecommended && (
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant={node.subjectClass === 'BASE' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {node.subjectClass}
          </Badge>
          <Badge
            variant={node.subjectType === 'FIN' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {node.subjectType}
          </Badge>
        </div>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function GroupSubjectSelectTree({
  nodes,
  selectedId,
  onSelect,
}: GroupSubjectSelectTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}
