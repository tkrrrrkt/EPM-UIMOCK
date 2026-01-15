'use client'

import type React from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui'
import { Plus, Pencil, PowerOff, Power } from 'lucide-react'
import type { BffDepartmentTreeNode } from '@epm/contracts/bff/organization-master'

interface DepartmentContextMenuProps {
  children: React.ReactNode
  node: BffDepartmentTreeNode
  onCreateChild: (node: BffDepartmentTreeNode) => void
  onEdit: (node: BffDepartmentTreeNode) => void
  onDeactivate: (node: BffDepartmentTreeNode) => void
  onReactivate: (node: BffDepartmentTreeNode) => void
}

export function DepartmentContextMenu({
  children,
  node,
  onCreateChild,
  onEdit,
  onDeactivate,
  onReactivate,
}: DepartmentContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onCreateChild(node)}>
          <Plus className="mr-2 h-4 w-4" />
          子部門を追加
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(node)}>
          <Pencil className="mr-2 h-4 w-4" />
          編集
        </ContextMenuItem>
        <ContextMenuSeparator />
        {node.isActive ? (
          <ContextMenuItem onClick={() => onDeactivate(node)}>
            <PowerOff className="mr-2 h-4 w-4" />
            無効化
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => onReactivate(node)}>
            <Power className="mr-2 h-4 w-4" />
            再有効化
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
