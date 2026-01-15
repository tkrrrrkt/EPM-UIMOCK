'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Button, Card, Separator } from '@/shared/ui'
import { CompanyTree } from './components/CompanyTree'
import { CompanySearchPanel } from './components/CompanySearchPanel'
import { CompanyList } from './components/CompanyList'
import { CompanyDetailDialog } from './components/CompanyDetailDialog'
import { CreateCompanyDialog } from './components/CreateCompanyDialog'
import { bffClient } from './api'
import type { BffCompanySummary, BffCompanyTreeNode, ConsolidationType } from '@epm/contracts/bff/company-master'

export default function CompanyMasterPage() {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<BffCompanySummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [treeRoots, setTreeRoots] = useState<BffCompanyTreeNode[]>([])

  // Search/Filter state
  const [keyword, setKeyword] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('all')
  const [consolidationTypeFilter, setConsolidationTypeFilter] = useState('all')

  // Pagination/Sort state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('companyCode')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Dialog state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [page, sortBy, sortOrder, keyword, isActiveFilter, consolidationTypeFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [listResponse, treeResponse] = await Promise.all([
        bffClient.listCompanies({
          page,
          pageSize,
          sortBy: sortBy as 'companyCode' | 'companyName',
          sortOrder,
          keyword: keyword || undefined,
          isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'true',
          consolidationType:
            consolidationTypeFilter === 'all' ? undefined : (consolidationTypeFilter as ConsolidationType),
        }),
        bffClient.getCompanyTree(),
      ])
      setCompanies(listResponse.items)
      setTotalCount(listResponse.totalCount)
      setTreeRoots(treeResponse.roots)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id)
    setDetailDialogOpen(true)
  }

  const handleSuccess = () => {
    loadData()
  }

  const availableParents = companies
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c.id,
      name: `${c.companyCode} - ${c.companyName}`,
    }))

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">法人マスタ</h1>
          <p className="text-muted-foreground mt-1">法人情報の管理・編集</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">会社階層</h2>
            <CompanyTree roots={treeRoots} onSelectCompany={handleSelectCompany} />
          </div>
        </div>
      </Card>

      <Separator />

      <div className="space-y-4">
        <CompanySearchPanel
          keyword={keyword}
          onKeywordChange={(value) => {
            setKeyword(value)
            setPage(1)
          }}
          isActiveFilter={isActiveFilter}
          onIsActiveFilterChange={(value) => {
            setIsActiveFilter(value)
            setPage(1)
          }}
          consolidationTypeFilter={consolidationTypeFilter}
          onConsolidationTypeFilterChange={(value) => {
            setConsolidationTypeFilter(value)
            setPage(1)
          }}
        />

        <CompanyList
          companies={companies}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={setPage}
          onSelectCompany={handleSelectCompany}
        />
      </div>

      <CompanyDetailDialog
        companyId={selectedCompanyId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onSuccess={handleSuccess}
        availableParents={availableParents}
      />

      <CreateCompanyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
        availableParents={availableParents}
      />
    </div>
  )
}
