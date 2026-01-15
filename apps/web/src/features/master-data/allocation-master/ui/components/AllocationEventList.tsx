'use client'

import type React from 'react'
import { ArrowUpDown, Copy, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui'
import type { BffAllocationEventResponse } from '@epm/contracts/bff/allocation-master'
import { SCENARIO_TYPE_LABELS } from '../constants'
import { cn } from '@/lib/utils'

interface AllocationEventListProps {
  events: BffAllocationEventResponse[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  onSelectEvent: (id: string) => void
  onCopyEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
}

export function AllocationEventList({
  events,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onSelectEvent,
  onCopyEvent,
  onDeleteEvent,
}: AllocationEventListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onSort(column)}>
      {children}
      <ArrowUpDown className={cn('h-3 w-3', sortBy === column && 'text-primary')} />
    </Button>
  )

  if (events.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">該当する配賦イベントが見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton column="eventCode">イベントコード</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="eventName">イベント名</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="scenarioType">シナリオ</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="isActive">状態</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="updatedAt">更新日時</SortButton>
              </TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                className={cn('cursor-pointer', !event.isActive && 'opacity-50')}
                onClick={() => onSelectEvent(event.id)}
              >
                <TableCell className="font-mono">{event.eventCode}</TableCell>
                <TableCell className="font-medium">{event.eventName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{SCENARIO_TYPE_LABELS[event.scenarioType]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={event.isActive ? 'default' : 'secondary'}>
                    {event.isActive ? '有効' : '無効'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(event.updatedAt).toLocaleString('ja-JP')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCopyEvent(event.id)
                      }}
                      title="コピー"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteEvent(event.id)
                      }}
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={cn(page === 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink onClick={() => onPageChange(pageNum)} isActive={page === pageNum}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && onPageChange(page + 1)}
                className={cn(page === totalPages && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <p className="text-sm text-muted-foreground text-center">
        全{totalCount}件中 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)}件を表示
      </p>
    </div>
  )
}
