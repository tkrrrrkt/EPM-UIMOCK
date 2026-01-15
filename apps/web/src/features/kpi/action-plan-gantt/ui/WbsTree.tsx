"use client"

import type { ReactElement } from "react"
import { WbsTreeRow } from "./WbsTreeRow"
import type { WbsTreeNode } from "../types"

interface WbsTreeProps {
  nodes: WbsTreeNode[]
  selectedId: string | null
  onToggle: (id: string) => void
  onSelect: (wbs: WbsTreeNode) => void
}

export function WbsTree({ nodes, selectedId, onToggle, onSelect }: WbsTreeProps) {
  const renderNode = (node: WbsTreeNode): ReactElement[] => {
    const elements: ReactElement[] = [
      <WbsTreeRow key={node.id} node={node} onToggle={onToggle} onClick={onSelect} selected={selectedId === node.id} />,
    ]

    if (node.isExpanded && node.children.length > 0) {
      node.children.forEach((child) => {
        elements.push(...renderNode(child))
      })
    }

    return elements
  }

  return (
    <div className="border-r bg-background">
      <div className="sticky top-[73px] bg-muted/50 border-b px-4 py-2">
        <div className="text-xs font-medium text-muted-foreground">WBS構造</div>
      </div>
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 73px - 41px - 48px)" }}>
        {nodes.map((node) => renderNode(node))}
      </div>
    </div>
  )
}
