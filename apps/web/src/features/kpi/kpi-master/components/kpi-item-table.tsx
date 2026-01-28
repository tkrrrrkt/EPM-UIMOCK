'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { BffKpiItem } from '../lib/types'
import { getKpiTypeLabel, getHierarchyLevelLabel } from '../lib/types'

interface KpiItemTableProps {
  items: BffKpiItem[]
  onEditItem: (item: BffKpiItem) => void
  onDeleteItem: (itemId: string) => void
}

export function KpiItemTable({
  items,
  onEditItem,
  onDeleteItem,
}: KpiItemTableProps) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-24">KPIコード</TableHead>
            <TableHead>KPI名</TableHead>
            <TableHead className="w-24 text-center">種別</TableHead>
            <TableHead className="w-20 text-center">階層</TableHead>
            <TableHead className="w-24">部門</TableHead>
            <TableHead className="w-24">責任者</TableHead>
            <TableHead className="w-20 text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/10">
              <TableCell className="font-medium">{item.kpiCode}</TableCell>
              <TableCell>
                {item.parentKpiItemId && (
                  <span className="mr-2 text-muted-foreground">└</span>
                )}
                {item.kpiName}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {getKpiTypeLabel(item.kpiType)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="text-xs">
                  {getHierarchyLevelLabel(item.hierarchyLevel)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.departmentName ?? '-'}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.ownerEmployeeName ?? '-'}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditItem(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                KPI項目が登録されていません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
