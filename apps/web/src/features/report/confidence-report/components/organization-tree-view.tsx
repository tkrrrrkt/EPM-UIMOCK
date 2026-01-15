"use client"

import { useEffect, useState } from "react"
import { ChevronRight, ChevronDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffConfidenceOrgNode } from "@epm/contracts/bff/confidence-report"

export interface OrgNode {
  id: string
  name: string
  level: number
  hasChildren: boolean
  children?: OrgNode[]
}

interface OrganizationTreeViewProps {
  selectedNode: OrgNode | null
  onSelectNode: (node: OrgNode | null) => void
}

export function OrganizationTreeView({ selectedNode, onSelectNode }: OrganizationTreeViewProps) {
  const client = useBffClient()
  const [nodes, setNodes] = useState<OrgNode[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["all"]))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrgTree() {
      setLoading(true)
      try {
        const response = await client.getOrgTree()
        setNodes(response.nodes)
        // デフォルトで最初のノードを選択
        if (response.nodes.length > 0 && !selectedNode) {
          onSelectNode(response.nodes[0])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrgTree()
  }, [client])

  const toggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const renderNode = (node: OrgNode, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedNode?.id === node.id

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-accent/50 transition-colors",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelectNode(node)}
        >
          {node.hasChildren ? (
            <button
              className="p-0.5 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(node.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span
            className={cn(
              "text-sm truncate",
              isSelected ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {node.name}
          </span>
        </div>
        {node.hasChildren && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  return <div className="space-y-1">{nodes.map((node) => renderNode(node))}</div>
}
