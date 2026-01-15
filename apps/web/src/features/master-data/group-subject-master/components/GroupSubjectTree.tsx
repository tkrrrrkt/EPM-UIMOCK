"use client"

import { ScrollArea, Card } from "@/shared/ui"
import { GroupSubjectTreeNode } from "./GroupSubjectTreeNode"
import { Loader2, FolderTree } from "lucide-react"
import type { BffGroupSubjectTreeNode } from "@epm/contracts/bff/group-subject-master"

interface GroupSubjectTreeProps {
  nodes: BffGroupSubjectTreeNode[]
  unassigned: BffGroupSubjectTreeNode[]
  selectedId?: string
  onSelect: (node: BffGroupSubjectTreeNode) => void
  isLoading?: boolean
}

export function GroupSubjectTree({ nodes, unassigned, selectedId, onSelect, isLoading }: GroupSubjectTreeProps) {
  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">読み込み中...</p>
        </div>
      </Card>
    )
  }

  if (nodes.length === 0 && unassigned.length === 0) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <FolderTree className="h-12 w-12" />
          <p className="text-sm">連結勘定科目が見つかりません</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-2">
          {nodes.length > 0 && (
            <div className="space-y-1">
              {nodes.map((node) => (
                <GroupSubjectTreeNode key={node.id} node={node} level={0} selectedId={selectedId} onSelect={onSelect} />
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-2">未割り当て</h3>
              <div className="space-y-1">
                {unassigned.map((node) => (
                  <GroupSubjectTreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
