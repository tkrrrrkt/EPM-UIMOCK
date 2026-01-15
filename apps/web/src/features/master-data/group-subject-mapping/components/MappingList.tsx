'use client'

import type React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  Badge,
  Button,
  Card,
} from '@/shared/ui'
import { ArrowUpDown } from 'lucide-react'
import type { BffMappingListItem, BffMappingListRequest } from '@epm/contracts/bff/group-subject-mapping'

interface MappingListProps {
  items: BffMappingListItem[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onRowClick: (item: BffMappingListItem) => void
  onSort: (sortBy: BffMappingListRequest['sortBy']) => void
  currentSort: { sortBy: string; sortOrder: 'asc' | 'desc' }
}

export function MappingList({
  items,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onSort,
  currentSort,
}: MappingListProps) {
  const allSelectableIds = items.map((item) => item.companySubjectId)
  const isAllSelected =
    allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedIds.includes(id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allSelectableIds)
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const SortButton = ({
    field,
    children,
  }: {
    field: BffMappingListRequest['sortBy']
    children: React.ReactNode
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=on]:bg-accent"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全て選択"
                />
              </TableHead>
              <TableHead>
                <SortButton field="subjectCode">会社科目コード</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="subjectName">会社科目名</SortButton>
              </TableHead>
              <TableHead>科目クラス</TableHead>
              <TableHead>科目タイプ</TableHead>
              <TableHead>
                <SortButton field="groupSubjectCode">連結科目コード</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="groupSubjectName">連結科目名</SortButton>
              </TableHead>
              <TableHead className="text-center">係数</TableHead>
              <TableHead className="text-center">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.companySubjectId}
                className={`cursor-pointer ${!item.isMapped ? 'bg-muted/30' : ''}`}
                onClick={() => onRowClick(item)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(item.companySubjectId)}
                    onCheckedChange={() => handleSelectOne(item.companySubjectId)}
                    aria-label={`${item.companySubjectCode}を選択`}
                  />
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono">{item.companySubjectCode}</code>
                </TableCell>
                <TableCell className="font-medium">
                  {item.companySubjectName}
                  {item.companySubjectIsContra && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      控除
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={item.companySubjectClass === 'BASE' ? 'secondary' : 'outline'}>
                    {item.companySubjectClass}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.companySubjectType === 'FIN' ? 'default' : 'secondary'}>
                    {item.companySubjectType}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.groupSubjectCode ? (
                    <code className="text-xs font-mono">{item.groupSubjectCode}</code>
                  ) : (
                    <span className="text-xs text-muted-foreground">未設定</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.groupSubjectName || (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.coefficient === 1 ? (
                    <span className="text-xs">+1</span>
                  ) : item.coefficient === -1 ? (
                    <span className="text-xs text-destructive">-1</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.isMapped ? (
                    <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-xs">
                      {item.isActive ? '有効' : '無効'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      未設定
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  該当するマッピングが見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
