'use client'

import { ArrowUpDown, MoreHorizontal, Settings, Users, Power, PowerOff } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui'
import type { BffRoleSummary } from '@epm/contracts/bff/permission-settings'

interface RoleListProps {
  roles: BffRoleSummary[]
  totalCount: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onPageChange: (page: number) => void
  onSelectRole: (id: string) => void
  onEditPermissions: (id: string) => void
  onDeactivate: (id: string) => void
  onActivate: (id: string) => void
}

export function RoleList({
  roles,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onSelectRole,
  onEditPermissions,
  onDeactivate,
  onActivate,
}: RoleListProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

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
              <TableHead className="w-[140px]">
                <SortableHeader column="roleCode">ロールコード</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="roleName">ロール名</SortableHeader>
              </TableHead>
              <TableHead className="w-[200px]">説明</TableHead>
              <TableHead className="w-[120px] text-center">
                <SortableHeader column="assignedEmployeeCount">割当人数</SortableHeader>
              </TableHead>
              <TableHead className="w-[100px] text-center">ステータス</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  ロールが見つかりません
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectRole(role.id)}
                >
                  <TableCell className="font-mono text-sm">{role.roleCode}</TableCell>
                  <TableCell className="font-medium">{role.roleName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                    {role.roleDescription || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{role.assignedEmployeeCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={role.isActive ? 'default' : 'secondary'}>
                      {role.isActive ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditPermissions(role.id)
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          権限設定
                        </DropdownMenuItem>
                        {role.isActive ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeactivate(role.id)
                            }}
                            disabled={role.assignedEmployeeCount > 0}
                            className="text-destructive"
                          >
                            <PowerOff className="mr-2 h-4 w-4" />
                            無効化
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onActivate(role.id)
                            }}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            再有効化
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
