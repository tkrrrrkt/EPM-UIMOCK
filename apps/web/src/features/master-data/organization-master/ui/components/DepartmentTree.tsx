'use client'

import type React from 'react'
import { useState } from 'react'
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from '@/shared/ui'
import { Search, Plus } from 'lucide-react'
import type { BffDepartmentTreeNode, BffDepartmentTreeRequest, OrgUnitType } from '@epm/contracts/bff/organization-master'
import { DepartmentTreeNode } from './DepartmentTreeNode'
import { DepartmentContextMenu } from './DepartmentContextMenu'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ORG_UNIT_TYPE_OPTIONS } from '../../constants/options'

interface DepartmentTreeProps {
  nodes: BffDepartmentTreeNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (departmentId: string, newParentId: string | null) => void
  onFilterChange: (filters: BffDepartmentTreeRequest) => void
  onCreateChild: (node: BffDepartmentTreeNode) => void
  onCreateRoot: () => void
  onEdit: (node: BffDepartmentTreeNode) => void
  onDeactivate: (node: BffDepartmentTreeNode) => void
  onReactivate: (node: BffDepartmentTreeNode) => void
}

export function DepartmentTree({
  nodes,
  selectedId,
  onSelect,
  onMove,
  onFilterChange,
  onCreateChild,
  onCreateRoot,
  onEdit,
  onDeactivate,
  onReactivate,
}: DepartmentTreeProps) {
  const [keyword, setKeyword] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [orgTypeFilter, setOrgTypeFilter] = useState<string>('all')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onMove(String(active.id), String(over.id))
    }
  }

  const handleSearch = () => {
    onFilterChange({
      keyword: keyword || undefined,
      isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
      orgUnitType: orgTypeFilter === 'all' ? undefined : (orgTypeFilter as OrgUnitType),
    })
  }

  const handleClearFilters = () => {
    setKeyword('')
    setActiveFilter('all')
    setOrgTypeFilter('all')
    onFilterChange({})
  }

  const flattenIds = (nodeList: BffDepartmentTreeNode[]): string[] => {
    const ids: string[] = []
    nodeList.forEach((node) => {
      ids.push(node.id)
      if (node.children.length > 0) {
        ids.push(...flattenIds(node.children))
      }
    })
    return ids
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">部門ツリー</h2>
          <Button size="sm" onClick={onCreateRoot}>
            <Plus className="mr-1 h-4 w-4" />
            新規部門
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="部門コード・名称で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>検索</Button>
          </div>

          <div className="flex gap-2">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">有効のみ</SelectItem>
                <SelectItem value="inactive">無効のみ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orgTypeFilter} onValueChange={setOrgTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="組織単位種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {ORG_UNIT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full bg-transparent">
            フィルタをクリア
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flattenIds(nodes)} strategy={verticalListSortingStrategy}>
              {nodes.map((node) => (
                <DepartmentContextMenu
                  key={node.id}
                  node={node}
                  onCreateChild={onCreateChild}
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onReactivate={onReactivate}
                >
                  <DepartmentTreeNode
                    node={node}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onCreateChild={onCreateChild}
                    onEdit={onEdit}
                    onDeactivate={onDeactivate}
                    onReactivate={onReactivate}
                  />
                </DepartmentContextMenu>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}
