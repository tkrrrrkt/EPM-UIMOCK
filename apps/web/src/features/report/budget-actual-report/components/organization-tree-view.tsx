"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Building2 } from "lucide-react"
import { Button } from "@/shared/ui/components/button"
import { ScrollArea } from "@/shared/ui/components/scroll-area"
import { ReportDataGrid } from "./report-data-grid"
import { cn } from "@/lib/utils"
import type { ComparisonMode } from "./report-header"

interface OrgNode {
  id: string
  name: string
  children?: OrgNode[]
}

const mockOrgTree: OrgNode[] = [
  {
    id: "corp",
    name: "株式会社サンプル",
    children: [
      {
        id: "sales",
        name: "営業本部",
        children: [
          { id: "sales-1", name: "第1営業部" },
          { id: "sales-2", name: "第2営業部" },
          { id: "sales-3", name: "第3営業部" },
        ],
      },
      {
        id: "dev",
        name: "開発本部",
        children: [
          { id: "dev-1", name: "プロダクト開発部" },
          { id: "dev-2", name: "インフラ部" },
        ],
      },
      {
        id: "admin",
        name: "管理本部",
        children: [
          { id: "finance", name: "財務経理部" },
          { id: "hr", name: "人事部" },
        ],
      },
    ],
  },
]

interface TreeNodeProps {
  node: OrgNode
  level: number
  onSelect: (id: string) => void
  selectedId: string | null
}

function TreeNode({ node, level, onSelect, selectedId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 h-9 px-2 hover:bg-muted/50 font-normal",
          isSelected && "bg-muted/60 text-foreground"
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
          onSelect(node.id)
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate text-sm">{node.name}</span>
      </Button>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface OrganizationTreeViewProps {
  comparisonMode: ComparisonMode
}

export function OrganizationTreeView({ comparisonMode }: OrganizationTreeViewProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>("corp")

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Organization Tree */}
      <div className="w-80 border-r border-border bg-card/50">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-medium text-sm text-foreground">組織選択</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2">
            {mockOrgTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                onSelect={setSelectedOrgId}
                selectedId={selectedOrgId}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Content - Data Grid */}
      <div className="flex-1 min-w-0 overflow-auto">
        <ReportDataGrid organizationId={selectedOrgId} comparisonMode={comparisonMode} />
      </div>
    </div>
  )
}
