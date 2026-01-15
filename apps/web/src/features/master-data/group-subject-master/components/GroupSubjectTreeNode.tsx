"use client"

import type React from "react"
import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Plus, Minus } from "lucide-react"
import { Badge } from "@/shared/ui"
import { cn } from "@/lib/utils"
import type { BffGroupSubjectTreeNode } from "@epm/contracts/bff/group-subject-master"

interface GroupSubjectTreeNodeProps {
  node: BffGroupSubjectTreeNode
  level: number
  selectedId?: string
  onSelect: (node: BffGroupSubjectTreeNode) => void
}

export function GroupSubjectTreeNode({ node, level, selectedId, onSelect }: GroupSubjectTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleClick = () => {
    onSelect(node)
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 cursor-pointer rounded-md hover:bg-accent transition-colors",
          isSelected && "bg-accent border border-primary/20",
          !node.isActive && "opacity-60",
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button onClick={handleToggle} className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {node.subjectClass === "AGGREGATE" ? (
          isExpanded && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-secondary" />
          ) : (
            <Folder className="h-4 w-4 text-secondary" />
          )
        ) : (
          <FileText className="h-4 w-4 text-primary" />
        )}

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground shrink-0">{node.groupSubjectCode}</span>
          <span className="text-sm truncate">{node.groupSubjectName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {node.coefficient !== undefined && (
            <Badge variant={node.coefficient === 1 ? "default" : "destructive"} className="text-xs">
              {node.coefficient === 1 ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {node.subjectClass === "BASE" ? "通常" : "集計"}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {node.subjectType}
          </Badge>
          {!node.isActive && (
            <Badge variant="destructive" className="text-xs">
              無効
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <GroupSubjectTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
