'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button, Card } from '@/shared/ui'
import { ProjectSearchPanel } from './components/ProjectSearchPanel'
import { ProjectList } from './components/ProjectList'
import { bffClient } from './api'
import type {
  BffProjectSummary,
  BffDepartmentOption,
  BffStatusOption,
  ProjectStatus,
} from '@epm/contracts/bff/project-profitability'

export default function ProjectProfitabilityPage() {
  // Filter options
  const [departments, setDepartments] = useState<BffDepartmentOption[]>([])
  const [statuses, setStatuses] = useState<BffStatusOption[]>([])

  // List state
  const [listLoading, setListLoading] = useState(false)
  const [projects, setProjects] = useState<BffProjectSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [departmentStableId, setDepartmentStableId] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [sortBy, setSortBy] = useState('projectName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filters = await bffClient.getFilters()
        setDepartments(filters.departments)
        setStatuses(filters.statuses)
      } catch (error) {
        console.error('Failed to load filters:', error)
      }
    }
    loadFilters()
  }, [])

  // Load list
  const loadProjects = useCallback(async () => {
    setListLoading(true)
    try {
      const response = await bffClient.listProjects({
        page,
        pageSize,
        sortBy: sortBy as 'projectName' | 'departmentName' | 'revenueBudget' | 'revenueProjection' | 'grossProfitRate',
        sortOrder,
        keyword: keyword || undefined,
        departmentStableId: departmentStableId === 'all' ? undefined : departmentStableId,
        status: status === 'all' ? undefined : (status as ProjectStatus),
      })
      setProjects(response.items)
      setTotalCount(response.totalCount)
    } finally {
      setListLoading(false)
    }
  }, [page, pageSize, sortBy, sortOrder, keyword, departmentStableId, status])

  // Initial load and reload on filter changes
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartmentStableId(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  // 警告PJ件数をカウント
  const warningCount = projects.filter(p => p.isWarning).length

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PJ採算照会</h1>
          <p className="text-muted-foreground mt-1">
            プロジェクト別の予算・実績・見込と採算状況を確認
            {warningCount > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                （警告: {warningCount}件）
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={loadProjects} disabled={listLoading}>
          <RefreshCw className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search Panel */}
      <Card className="p-4">
        <ProjectSearchPanel
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          departmentStableId={departmentStableId}
          onDepartmentChange={handleDepartmentChange}
          status={status}
          onStatusChange={handleStatusChange}
          departments={departments}
          statuses={statuses}
        />
      </Card>

      {/* Project List - Full Width */}
      <Card className="p-4">
        <ProjectList
          projects={projects}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Card>
    </div>
  )
}
