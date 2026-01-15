'use client'

import type React from 'react'
import { ArrowUpDown, Trash2 } from 'lucide-react'
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
import type { BffAllocationDriverResponse } from '@epm/contracts/bff/allocation-master'
import { DRIVER_TYPE_LABELS, DRIVER_SOURCE_TYPE_LABELS } from '../constants'
import { cn } from '@/lib/utils'

interface AllocationDriverListProps {
  drivers: BffAllocationDriverResponse[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  onSelectDriver: (id: string) => void
  onDeleteDriver: (id: string) => void
}

export function AllocationDriverList({
  drivers,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onSelectDriver,
  onDeleteDriver,
}: AllocationDriverListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onSort(column)}>
      {children}
      <ArrowUpDown className={cn('h-3 w-3', sortBy === column && 'text-primary')} />
    </Button>
  )

  if (drivers.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">該当する配賦ドライバが見つかりませんでした</p>
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
                <SortButton column="driverCode">ドライバコード</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="driverName">ドライバ名</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="driverType">タイプ</SortButton>
              </TableHead>
              <TableHead>ソース</TableHead>
              <TableHead>参照先</TableHead>
              <TableHead>
                <SortButton column="updatedAt">更新日時</SortButton>
              </TableHead>
              <TableHead className="w-[60px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow
                key={driver.id}
                className="cursor-pointer"
                onClick={() => onSelectDriver(driver.id)}
              >
                <TableCell className="font-mono">{driver.driverCode}</TableCell>
                <TableCell className="font-medium">{driver.driverName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{DRIVER_TYPE_LABELS[driver.driverType]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{DRIVER_SOURCE_TYPE_LABELS[driver.sourceType]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {driver.driverSubjectName ||
                    driver.measureKey ||
                    driver.kpiSubjectName ||
                    '-'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(driver.updatedAt).toLocaleString('ja-JP')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteDriver(driver.id)
                    }}
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
