"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription } from "@/shared/ui"
import { LayoutListTable } from "../components/LayoutListTable"
import { LayoutFilters } from "../components/LayoutFilters"
import { CreateLayoutDialog } from "../components/CreateLayoutDialog"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../lib/error-messages"
import type { BffLayoutListRequest, BffLayoutSummary } from "@epm/contracts/bff/report-layout"

export default function LayoutListPage() {
  const router = useRouter()
  const [layouts, setLayouts] = useState<BffLayoutSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [filters, setFilters] = useState<Omit<BffLayoutListRequest, "page" | "pageSize">>({
    keyword: "",
    layoutType: undefined,
    isActive: undefined,
    sortBy: "layoutCode",
    sortOrder: "asc",
  })

  useEffect(() => {
    loadLayouts()
  }, [filters, page])

  const loadLayouts = async () => {
    setLoading(true)
    setError(null)
    try {
      const request: BffLayoutListRequest = {
        ...filters,
        page,
        pageSize,
      }
      const response = await bffClient.getLayouts(request)
      setLayouts(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<BffLayoutListRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const handleRowClick = (layoutId: string) => {
    router.push(`/master-data/report-layout/${layoutId}`)
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    setPage(1)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">レポートレイアウト管理</h1>
            <p className="text-muted-foreground">
              PL/BS/KPIレポートの表示レイアウトを定義・管理します
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>新規作成</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>レイアウト一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <LayoutFilters filters={filters} onFilterChange={handleFilterChange} />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
              ) : (
                <LayoutListTable
                  layouts={layouts}
                  page={page}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  onPageChange={setPage}
                  onRowClick={handleRowClick}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateLayoutDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleCreateSuccess} />
    </div>
  )
}
