"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Search, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "./checkbox"
import { Input } from "./input"
import { ScrollArea } from "./scroll-area"
import { Button } from "./button"

// ============================================
// Types
// ============================================

export interface DepartmentNode {
  id: string
  code: string
  name: string
  parentId: string | null
  level: number
  children?: DepartmentNode[]
  isLeaf?: boolean
  metadata?: {
    headcount?: number
    managerId?: string
    managerName?: string
  }
}

export interface DepartmentSelection {
  departmentId: string
  includeDescendants: boolean
}

export interface DepartmentTreeSelectorProps {
  departments: DepartmentNode[]
  value: DepartmentSelection[]
  onChange: (value: DepartmentSelection[]) => void
  selectionMode?: "single" | "multiple"
  showIncludeDescendantsToggle?: boolean
  showSelectAll?: boolean
  showSelectedCount?: boolean
  expandLevel?: number
  searchable?: boolean
  maxHeight?: string
  className?: string
  disabled?: boolean
  disabledIds?: string[]
  "aria-label"?: string
}

// ============================================
// Utility Functions
// ============================================

function flattenDepartments(nodes: DepartmentNode[]): DepartmentNode[] {
  const result: DepartmentNode[] = []
  function traverse(node: DepartmentNode) {
    result.push(node)
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  nodes.forEach(traverse)
  return result
}

function getDescendantIds(node: DepartmentNode): string[] {
  const ids: string[] = []
  function traverse(n: DepartmentNode) {
    if (n.children) {
      n.children.forEach((child) => {
        ids.push(child.id)
        traverse(child)
      })
    }
  }
  traverse(node)
  return ids
}

function getAncestorIds(
  nodeId: string,
  flatNodes: DepartmentNode[]
): string[] {
  const ids: string[] = []
  const nodeMap = new Map(flatNodes.map((n) => [n.id, n]))
  let current = nodeMap.get(nodeId)
  while (current?.parentId) {
    ids.push(current.parentId)
    current = nodeMap.get(current.parentId)
  }
  return ids
}

function filterDepartments(
  nodes: DepartmentNode[],
  searchTerm: string
): DepartmentNode[] {
  if (!searchTerm.trim()) return nodes

  const lowerTerm = searchTerm.toLowerCase()
  const flatNodes = flattenDepartments(nodes)
  const matchingIds = new Set<string>()

  // Find matching nodes and their ancestors
  flatNodes.forEach((node) => {
    if (
      node.name.toLowerCase().includes(lowerTerm) ||
      node.code.toLowerCase().includes(lowerTerm)
    ) {
      matchingIds.add(node.id)
      getAncestorIds(node.id, flatNodes).forEach((id) => matchingIds.add(id))
    }
  })

  // Rebuild tree with only matching nodes
  function filterTree(nodeList: DepartmentNode[]): DepartmentNode[] {
    return nodeList
      .filter((node) => matchingIds.has(node.id))
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined,
      }))
  }

  return filterTree(nodes)
}

// Expand selection to get all department IDs
export function expandSelection(
  selections: DepartmentSelection[],
  departments: DepartmentNode[]
): string[] {
  const flatNodes = flattenDepartments(departments)
  const nodeMap = new Map(flatNodes.map((n) => [n.id, n]))
  const result = new Set<string>()

  selections.forEach((selection) => {
    result.add(selection.departmentId)
    if (selection.includeDescendants) {
      const node = nodeMap.get(selection.departmentId)
      if (node) {
        getDescendantIds(node).forEach((id) => result.add(id))
      }
    }
  })

  return Array.from(result)
}

// ============================================
// Component
// ============================================

export function DepartmentTreeSelector({
  departments,
  value,
  onChange,
  selectionMode = "multiple",
  showIncludeDescendantsToggle = true,
  showSelectAll = false,
  showSelectedCount = true,
  expandLevel = 1,
  searchable = true,
  maxHeight = "400px",
  className,
  disabled = false,
  disabledIds = [],
  "aria-label": ariaLabel,
}: DepartmentTreeSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    // Initialize expanded state based on expandLevel
    const expanded = new Set<string>()
    function expand(nodes: DepartmentNode[], currentLevel: number) {
      if (expandLevel === -1 || currentLevel < expandLevel) {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            expanded.add(node.id)
            expand(node.children, currentLevel + 1)
          }
        })
      }
    }
    expand(departments, 0)
    return expanded
  })

  const flatNodes = React.useMemo(
    () => flattenDepartments(departments),
    [departments]
  )

  const filteredDepartments = React.useMemo(
    () => filterDepartments(departments, searchTerm),
    [departments, searchTerm]
  )

  // Selection helpers
  const selectionMap = React.useMemo(() => {
    const map = new Map<string, DepartmentSelection>()
    value.forEach((s) => map.set(s.departmentId, s))
    return map
  }, [value])

  const isSelected = (nodeId: string) => selectionMap.has(nodeId)

  const isAutoSelected = (nodeId: string): boolean => {
    // Check if any ancestor has includeDescendants=true
    const ancestors = getAncestorIds(nodeId, flatNodes)
    return ancestors.some((ancestorId) => {
      const selection = selectionMap.get(ancestorId)
      return selection?.includeDescendants === true
    })
  }

  const getIncludeDescendants = (nodeId: string): boolean => {
    return selectionMap.get(nodeId)?.includeDescendants ?? false
  }

  // Selection actions
  const toggleSelection = (node: DepartmentNode) => {
    if (disabled || disabledIds.includes(node.id) || isAutoSelected(node.id)) {
      return
    }

    if (selectionMode === "single") {
      if (isSelected(node.id)) {
        onChange([])
      } else {
        onChange([{ departmentId: node.id, includeDescendants: false }])
      }
      return
    }

    // Multiple mode
    if (isSelected(node.id)) {
      // Deselect
      onChange(value.filter((s) => s.departmentId !== node.id))
    } else {
      // Select
      onChange([...value, { departmentId: node.id, includeDescendants: false }])
    }
  }

  const toggleIncludeDescendants = (node: DepartmentNode) => {
    if (disabled || !isSelected(node.id)) return

    const currentSelection = selectionMap.get(node.id)
    if (!currentSelection) return

    const newIncludeDescendants = !currentSelection.includeDescendants
    const descendantIds = getDescendantIds(node)

    let newValue = value.map((s) =>
      s.departmentId === node.id
        ? { ...s, includeDescendants: newIncludeDescendants }
        : s
    )

    if (newIncludeDescendants) {
      // Remove individual selections of descendants
      newValue = newValue.filter((s) => !descendantIds.includes(s.departmentId))
    }

    onChange(newValue)
  }

  const selectAll = () => {
    if (disabled) return
    const rootSelections = departments.map((node) => ({
      departmentId: node.id,
      includeDescendants: true,
    }))
    onChange(rootSelections)
  }

  const deselectAll = () => {
    if (disabled) return
    onChange([])
  }

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

  // Calculate selected count
  const selectedCount = React.useMemo(() => {
    return expandSelection(value, departments).length
  }, [value, departments])

  // Render tree node
  const renderNode = (node: DepartmentNode) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedIds.has(node.id)
    const selected = isSelected(node.id)
    const autoSelected = isAutoSelected(node.id)
    const includeDescendants = getIncludeDescendants(node.id)
    const isDisabled = disabled || disabledIds.includes(node.id)
    const isEffectivelyDisabled = isDisabled || autoSelected

    return (
      <div key={node.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 rounded-md hover:bg-muted/50 transition-colors",
            (selected || autoSelected) && "bg-primary/5",
            autoSelected && "opacity-70"
          )}
          style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="p-0.5 hover:bg-muted rounded shrink-0"
              aria-label={isExpanded ? "折りたたむ" : "展開する"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}

          {/* Checkbox */}
          <Checkbox
            checked={selected || autoSelected}
            onCheckedChange={() => toggleSelection(node)}
            disabled={isEffectivelyDisabled}
            className="shrink-0"
            aria-label={`${node.name}を選択`}
          />

          {/* Department icon */}
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />

          {/* Department name */}
          <span
            className={cn(
              "text-sm flex-1 truncate",
              autoSelected && "text-muted-foreground"
            )}
          >
            {node.name}
            {autoSelected && (
              <span className="text-xs text-muted-foreground ml-1">(自動)</span>
            )}
          </span>

          {/* Include descendants toggle */}
          {showIncludeDescendantsToggle && hasChildren && selected && !autoSelected && (
            <button
              type="button"
              onClick={() => toggleIncludeDescendants(node)}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-colors shrink-0",
                includeDescendants
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Checkbox
                checked={includeDescendants}
                className="h-3 w-3"
                aria-hidden="true"
              />
              <span>配下を含める</span>
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div role="group">
            {node.children!.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn("border rounded-lg bg-card", className)}
      role="tree"
      aria-label={ariaLabel ?? "部門選択"}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <span className="text-sm font-medium text-foreground">部門を選択</span>
        {showSelectedCount && (
          <span className="text-xs text-muted-foreground">
            {selectedCount}件選択中
          </span>
        )}
      </div>

      {/* Search */}
      {searchable && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="部門名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Select All / Deselect All */}
      {showSelectAll && selectionMode === "multiple" && (
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAll}
            disabled={disabled}
            className="h-7 text-xs"
          >
            全選択
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deselectAll}
            disabled={disabled}
            className="h-7 text-xs"
          >
            全解除
          </Button>
        </div>
      )}

      {/* Tree */}
      <ScrollArea style={{ maxHeight }} className="p-1">
        <div className="min-w-0">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((node) => renderNode(node))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {searchTerm ? "該当する部門が見つかりません" : "部門データがありません"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
