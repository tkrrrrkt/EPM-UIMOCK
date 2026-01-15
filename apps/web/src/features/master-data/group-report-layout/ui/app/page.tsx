"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription } from "@/shared/ui"
import type { BffGroupLayoutListRequest, BffGroupLayoutListResponse } from "@epm/contracts/bff/group-report-layout"
import { bffClient } from "../api/client"
import { LayoutFilters } from "../components/LayoutFilters"
import { LayoutListTable } from "../components/LayoutListTable"
import { CreateLayoutDialog } from "../components/CreateLayoutDialog"

export default function GroupLayoutListPage() {
  const [layouts, setLayouts] = useState<BffGroupLayoutListResponse | null>(null)
  const [filters, setFilters] = useState<Omit<BffGroupLayoutListRequest, "page" | "pageSize">>({})
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadContext()
  }, [])

  useEffect(() => {
    loadLayouts()
  }, [filters, page])

  const loadContext = async () => {
    try {
      const context = await bffClient.getContext()
      setCanEdit(context.canEdit)
    } catch (err) {
      console.error("[v0] Failed to load context:", err)
    }
  }

  const loadLayouts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await bffClient.getLayouts({
        ...filters,
        page,
        pageSize: 50,
      })
      setLayouts(response)
    } catch (err) {
      setError("レイアウト一覧の取得に失敗しました")
      console.error("[v0] Failed to load layouts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<BffGroupLayoutListRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    loadLayouts()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">連結レイアウトマスタ</h1>
            <p className="text-muted-foreground">
              連結決算レポートの表示レイアウトを管理します
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowCreateDialog(true)}>新規作成</Button>
          )}
          {!canEdit && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              参照モード（親会社のみ編集可能）
            </div>
          )}
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

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
              ) : layouts ? (
                <LayoutListTable layouts={layouts} page={page} onPageChange={setPage} />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateLayoutDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
