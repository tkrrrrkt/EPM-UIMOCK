"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WbsTreeNode } from "../types"

interface WbsTreeRowProps {
  node: WbsTreeNode
  onToggle: (id: string) => void
  onClick: (wbs: WbsTreeNode) => void
  selected: boolean
}

export function WbsTreeRow({ node, onToggle, onClick, selected }: WbsTreeRowProps) {
  const hasChildren = node.children.length > 0
  const rowHeight = 40
  const indentWidth = 20

  return (
    <div
      className={cn(
        "flex items-center border-b border-border/50 cursor-pointer transition-colors",
        "hover:bg-muted/50",
        selected && "bg-primary/10"
      )}
      style={{ height: `${rowHeight}px`, paddingLeft: `${node.level * indentWidth + 8}px` }}
      onClick={() => onClick(node)}
    >
      {/* Expand/Collapse button */}
      <button
        type="button"
        className={cn(
          "w-5 h-5 flex items-center justify-center mr-1 rounded",
          hasChildren ? "hover:bg-muted" : "invisible"
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) {
            onToggle(node.id)
          }
        }}
      >
        {hasChildren && (
          node.isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )
        )}
      </button>

      {/* Milestone indicator */}
      {node.isMilestone && (
        <div className="w-3 h-3 rotate-45 bg-amber-500 mr-2 shrink-0" />
      )}

      {/* WBS Code */}
      <span className="text-xs font-mono text-muted-foreground mr-2 shrink-0 min-w-[40px]">
        {node.wbsCode}
      </span>

      {/* WBS Name */}
      <span className="text-sm font-medium text-foreground truncate flex-1">
        {node.wbsName}
      </span>

      {/* Progress (if applicable) */}
      {!node.isMilestone && node.progressRate !== null && (
        <span className={cn(
          "text-xs ml-2 shrink-0",
          node.progressRate === 100 ? "text-green-600" : "text-muted-foreground"
        )}>
          {node.progressRate}%
        </span>
      )}
    </div>
  )
}
