'use client'

import { ArrowUpDown, UserX } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui'
import type { BffEmployeeAssignment, BffRoleSummary } from '@epm/contracts/bff/permission-settings'

interface EmployeeAssignmentListProps {
  employees: BffEmployeeAssignment[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  roles: BffRoleSummary[]
  onAssignRole: (employeeId: string, roleId: string) => void
  onRemoveRole: (employeeId: string) => void
  loading?: boolean
}

export function EmployeeAssignmentList({
  employees,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  roles,
  onAssignRole,
  onRemoveRole,
  loading = false,
}: EmployeeAssignmentListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const activeRoles = roles.filter((r) => r.isActive)

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => onSort(column)}>
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
      {sortBy === column && (
        <span className="ml-1 text-xs text-muted-foreground">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                <SortableHeader column="employeeCode">社員コード</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="employeeName">社員名</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="departmentName">所属部門</SortableHeader>
              </TableHead>
              <TableHead className="w-[200px]">
                <SortableHeader column="roleName">ロール</SortableHeader>
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  社員が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell className="font-mono text-sm">{employee.employeeCode}</TableCell>
                  <TableCell className="font-medium">{employee.employeeName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.departmentName || '-'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={employee.roleId || 'none'}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          // Don't do anything for "none" selection
                        } else {
                          onAssignRole(employee.employeeId, value)
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue>
                          {employee.roleId ? (
                            <span>{employee.roleName}</span>
                          ) : (
                            <span className="text-muted-foreground">未割当</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" disabled>
                          <span className="text-muted-foreground">未割当</span>
                        </SelectItem>
                        {activeRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.roleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {employee.roleId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveRole(employee.employeeId)}
                        disabled={loading}
                        title="ロール解除"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount}件中 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)}件を表示
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm">
                  {page} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
