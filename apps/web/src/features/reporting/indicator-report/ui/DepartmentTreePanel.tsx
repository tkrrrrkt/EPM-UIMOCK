"use client"

// ============================================================
// DepartmentTreePanel - Department tree with include children option
// ============================================================

import { useMemo, useState } from "react"
import { ChevronRight, ChevronDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  ScrollArea,
  Skeleton,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
} from "@/shared/ui"
import type { BffDepartmentNode } from "@epm/contracts/bff/indicator-report"

interface DepartmentTreePanelProps {
  departments: BffDepartmentNode[]
  selectedDepartmentId: string | null
  onDepartmentSelect: (departmentId: string) => void
  includeChildren: boolean
  onIncludeChildrenChange: (include: boolean) => void
  isLoading?: boolean
}

interface DepartmentNodeProps {
  node: BffDepartmentNode
  selectedId: string | null
  onSelect: (id: string) => void
  level: number
}

function DepartmentNode({
  node,
  selectedId,
  onSelect,
  level,
}: DepartmentNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0)
  const isSelected = selectedId === node.stableId
  const hasChildren =
    node.hasChildren && node.children && node.children.length > 0

  const paddingLeft = level * 16

  if (!hasChildren) {
    return (
      <button
        type="button"
        onClick={() => onSelect(node.stableId)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-foreground"
        )}
        style={{ paddingLeft: `${paddingLeft + 24}px` }}
      >
        <Building2 className="size-4 shrink-0 opacity-60" />
        <span className="truncate">{node.departmentName}</span>
        <span className="ml-auto text-xs opacity-60">{node.departmentCode}</span>
      </button>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "flex items-center rounded-md transition-colors",
          isSelected ? "bg-primary" : ""
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex size-6 items-center justify-center rounded hover:bg-muted/50",
              isSelected && "hover:bg-primary-foreground/20"
            )}
          >
            {isOpen ? (
              <ChevronDown
                className={cn(
                  "size-4",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
            ) : (
              <ChevronRight
                className={cn(
                  "size-4",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
            )}
          </button>
        </CollapsibleTrigger>
        <button
          type="button"
          onClick={() => onSelect(node.stableId)}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
            isSelected
              ? "text-primary-foreground"
              : "hover:bg-muted text-foreground"
          )}
        >
          <Building2 className="size-4 shrink-0 opacity-60" />
          <span className="truncate font-medium">{node.departmentName}</span>
          <span className="ml-auto text-xs opacity-60">
            {node.departmentCode}
          </span>
        </button>
      </div>
      <CollapsibleContent>
        <div className="mt-0.5">
          {node.children?.map((child) => (
            <DepartmentNode
              key={child.stableId}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function DepartmentTreePanel({
  departments,
  selectedDepartmentId,
  onDepartmentSelect,
  includeChildren,
  onIncludeChildrenChange,
  isLoading = false,
}: DepartmentTreePanelProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return departments

    const filterTree = (nodes: BffDepartmentNode[]): BffDepartmentNode[] => {
      return nodes.reduce<BffDepartmentNode[]>((acc, node) => {
        const nameMatch = node.departmentName.toLowerCase().includes(query)
        const codeMatch = node.departmentCode.toLowerCase().includes(query)
        const children = node.children ? filterTree(node.children) : []
        if (nameMatch || codeMatch || children.length > 0) {
          acc.push({ ...node, children })
        }
        return acc
      }, [])
    }

    return filterTree(departments)
  }, [departments, searchQuery])

  if (isLoading) {
    return (
      <Card className="border-border h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 bg-muted/10 h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
          <Building2 className="size-4" />
          部門
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Input
          placeholder="部門名・コードで検索"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-0.5">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <DepartmentNode
                  key={dept.stableId}
                  node={dept}
                  selectedId={selectedDepartmentId}
                  onSelect={onDepartmentSelect}
                  level={0}
                />
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                該当する部門がありません
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 pt-3 border-t border-border shrink-0">
          <Checkbox
            id="include-children"
            checked={includeChildren}
            onCheckedChange={(checked) =>
              onIncludeChildrenChange(checked === true)
            }
          />
          <Label
            htmlFor="include-children"
            className="text-sm text-foreground cursor-pointer"
          >
            配下を含む
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
