'use client'

import type React from 'react'
import { ArrowUpDown } from 'lucide-react'
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
import type { BffCompanySummary } from '@epm/contracts/bff/company-master'
import { CONSOLIDATION_TYPE_LABELS } from '../constants'
import { cn } from '@/lib/utils'

interface CompanyListProps {
  companies: BffCompanySummary[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  onSelectCompany: (id: string) => void
}

export function CompanyList({
  companies,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onSelectCompany,
}: CompanyListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onSort(column)}>
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </Button>
  )

  if (companies.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground">該当する法人が見つかりませんでした</p>
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
                <SortButton column="companyCode">法人コード</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="companyName">法人名</SortButton>
              </TableHead>
              <TableHead>連結種別</TableHead>
              <TableHead>通貨</TableHead>
              <TableHead>決算月</TableHead>
              <TableHead>状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow
                key={company.id}
                className={cn('cursor-pointer', !company.isActive && 'opacity-50')}
                onClick={() => onSelectCompany(company.id)}
              >
                <TableCell className="font-mono">{company.companyCode}</TableCell>
                <TableCell className="font-medium">{company.companyName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{CONSOLIDATION_TYPE_LABELS[company.consolidationType]}</Badge>
                </TableCell>
                <TableCell>{company.currencyCode}</TableCell>
                <TableCell>{company.fiscalYearEndMonth}月決算</TableCell>
                <TableCell>
                  <Badge variant={company.isActive ? 'default' : 'secondary'}>
                    {company.isActive ? '有効' : '無効'}
                  </Badge>
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
