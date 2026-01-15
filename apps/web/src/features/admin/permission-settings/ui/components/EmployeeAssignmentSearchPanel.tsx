'use client'

import { Search } from 'lucide-react'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { BffRoleSummary } from '@epm/contracts/bff/permission-settings'
import { mockDepartments } from '../../api'

interface EmployeeAssignmentSearchPanelProps {
  keyword: string
  onKeywordChange: (value: string) => void
  departmentFilter: string
  onDepartmentFilterChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  hasRoleFilter: string
  onHasRoleFilterChange: (value: string) => void
  roles: BffRoleSummary[]
}

export function EmployeeAssignmentSearchPanel({
  keyword,
  onKeywordChange,
  departmentFilter,
  onDepartmentFilterChange,
  roleFilter,
  onRoleFilterChange,
  hasRoleFilter,
  onHasRoleFilterChange,
  roles,
}: EmployeeAssignmentSearchPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="社員コード・社員名で検索..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[180px]">
        <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="部門" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての部門</SelectItem>
            {mockDepartments.map((dept) => (
              <SelectItem key={dept.stableId} value={dept.stableId}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="ロール" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのロール</SelectItem>
            {roles.filter((r) => r.isActive).map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[160px]">
        <Select value={hasRoleFilter} onValueChange={onHasRoleFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="割当状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="true">割当済み</SelectItem>
            <SelectItem value="false">未割当</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
