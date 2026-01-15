"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, FolderOpen, Folder, FileText, FolderTree } from "lucide-react"
import { Badge, Card, ScrollArea } from "@/shared/ui"
import type { BffSubjectTreeNode } from "@contracts/bff/subject-master"
import { cn } from "@/lib/utils"

interface SubjectTreeProps {
  nodes: BffSubjectTreeNode[]
  unassigned: BffSubjectTreeNode[]
  selectedId: string | null
  onSelect: (node: BffSubjectTreeNode) => void
  searchKeyword?: string
}

export function SubjectTree({ nodes, unassigned, selectedId, onSelect, searchKeyword }: SubjectTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["sub-005", "sub-003"]))

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (nodes: BffSubjectTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.subjectClass === "AGGREGATE") {
          allIds.add(node.id)
        }
        if (node.children.length > 0) {
          collectIds(node.children)
        }
      })
    }
    collectIds(nodes)
    setExpandedIds(allIds)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const renderNode = (node: BffSubjectTreeNode, level = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedId === node.id
    const hasChildren = node.children.length > 0
    const isAggregate = node.subjectClass === "AGGREGATE"

    const shouldHighlight =
      searchKeyword &&
      (node.subjectCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        node.subjectName.toLowerCase().includes(searchKeyword.toLowerCase()))

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-accent/50 rounded-md transition-colors",
            isSelected && "bg-accent",
            !node.isActive && "opacity-50",
            shouldHighlight && "bg-primary/10",
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => onSelect(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(node.id)
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-5" />}

          {isAggregate ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}

          <div className="flex-1 flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{node.subjectCode}</span>
            <span className="text-sm">{node.subjectName}</span>

            {node.coefficient !== undefined && (
              <Badge variant="outline" className="text-xs">
                {node.coefficient > 0 ? `+${node.coefficient}` : node.coefficient}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Badge variant={node.subjectType === "FIN" ? "default" : "secondary"} className="text-xs">
              {node.subjectType}
            </Badge>

            {isAggregate && (
              <Badge variant="outline" className="text-xs">
                集計
              </Badge>
            )}

            {!node.isActive && (
              <Badge variant="destructive" className="text-xs">
                無効
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && <div>{node.children.map((child) => renderNode(child, level + 1))}</div>}
      </div>
    )
  }

  if (nodes.length === 0 && unassigned.length === 0) {
    return (
      <Card className="p-8 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <FolderTree className="h-12 w-12" />
          <p className="text-sm">科目が見つかりません</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">科目ツリー</h3>
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs text-muted-foreground hover:text-foreground">
            すべて展開
          </button>
          <span className="text-muted-foreground">|</span>
          <button onClick={collapseAll} className="text-xs text-muted-foreground hover:text-foreground">
            すべて折りたたみ
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {nodes.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-3 py-2">集計科目</div>
              {nodes.map((node) => renderNode(node))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-2">未割り当て</h3>
              <div className="space-y-1">
                {unassigned.map((node) => renderNode(node))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
