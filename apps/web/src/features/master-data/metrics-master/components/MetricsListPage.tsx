"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@/shared/ui"
import { Search, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { MetricDetailDialog } from "./MetricDetailDialog"
import { bffClient } from "../api/client"
import type {
  BffMetricSummary,
  BffMetricDetailResponse,
  BffListMetricsRequest,
  MetricType,
} from "@epm/contracts/bff/metrics-master"

/**
 * 指標マスタ一覧ページ
 * SSoT: .kiro/specs/master-data/metrics-master/design.md
 */
export function MetricsListPage() {
  const [metrics, setMetrics] = useState<BffMetricSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const [searchRequest, setSearchRequest] = useState<BffListMetricsRequest>({
    keyword: "",
    metricType: undefined,
    isActive: undefined,
    page: 1,
    pageSize: 50,
    sortBy: "metricCode",
    sortOrder: "asc",
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<BffMetricDetailResponse | null>(null)

  // 総ページ数を計算
  const totalPages = Math.ceil(totalCount / (searchRequest.pageSize || 50))

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await bffClient.listMetrics(searchRequest)
      setMetrics(response.items)
      setTotalCount(response.totalCount)
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setLoading(false)
    }
  }, [searchRequest])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleSearch = () => {
    setSearchRequest((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setSearchRequest((prev) => ({ ...prev, page: newPage }))
  }

  const handleSort = (sortBy: "metricCode" | "metricName" | "metricType") => {
    setSearchRequest((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const handleCreate = () => {
    setSelectedMetric(null)
    setDialogOpen(true)
  }

  const handleEdit = async (metric: BffMetricSummary) => {
    try {
      // 詳細取得して編集ダイアログを開く
      const detail = await bffClient.getMetricById(metric.id)
      setSelectedMetric(detail)
      setDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch metric detail:", error)
    }
  }

  const handleDeactivate = async (metricId: string) => {
    try {
      await bffClient.deactivateMetric(metricId)
      fetchMetrics()
    } catch (error) {
      console.error("Failed to deactivate metric:", error)
    }
  }

  const handleReactivate = async (metricId: string) => {
    try {
      await bffClient.reactivateMetric(metricId)
      fetchMetrics()
    } catch (error) {
      console.error("Failed to reactivate metric:", error)
    }
  }

  const handleDialogSuccess = () => {
    setDialogOpen(false)
    fetchMetrics()
  }

  // 指標タイプの表示名
  const getMetricTypeLabel = (type: MetricType): string => {
    switch (type) {
      case "FIN_METRIC":
        return "財務指標"
      case "KPI_METRIC":
        return "KPI指標"
      default:
        return type
    }
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">指標マスタ</h1>
          <p className="text-sm text-muted-foreground">指標の登録・編集・管理</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          新規登録
        </Button>
      </div>

      {/* 検索フィルタ */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="指標コード、指標名で検索"
              value={searchRequest.keyword || ""}
              onChange={(e) => setSearchRequest((prev) => ({ ...prev, keyword: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" className="gap-2 bg-transparent">
              <Search className="h-4 w-4" />
              検索
            </Button>
          </div>
          <Select
            value={searchRequest.metricType || "all"}
            onValueChange={(value) =>
              setSearchRequest((prev) => ({
                ...prev,
                metricType: value === "all" ? undefined : (value as MetricType),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="指標タイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全タイプ</SelectItem>
              <SelectItem value="FIN_METRIC">財務指標</SelectItem>
              <SelectItem value="KPI_METRIC">KPI指標</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchRequest.isActive === undefined ? "all" : String(searchRequest.isActive)}
            onValueChange={(value) =>
              setSearchRequest((prev) => ({
                ...prev,
                isActive: value === "all" ? undefined : value === "true",
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="状態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="true">有効</SelectItem>
              <SelectItem value="false">無効</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* テーブル */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("metricCode")}>
                指標コード {searchRequest.sortBy === "metricCode" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("metricName")}>
                指標名 {searchRequest.sortBy === "metricName" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("metricType")}>
                指標タイプ {searchRequest.sortBy === "metricType" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>単位</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : metrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  指標が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.metricCode}</TableCell>
                  <TableCell>{metric.metricName}</TableCell>
                  <TableCell>
                    <Badge variant={metric.metricType === "FIN_METRIC" ? "default" : "outline"}>
                      {getMetricTypeLabel(metric.metricType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{metric.unit || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={metric.isActive ? "default" : "secondary"}>
                      {metric.isActive ? "有効" : "無効"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(metric)}>
                        編集
                      </Button>
                      {metric.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(metric.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          無効化
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivate(metric.id)}
                          className="text-primary hover:text-primary"
                        >
                          再有効化
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div className="text-sm text-muted-foreground">
          全 {totalCount} 件中{" "}
          {totalCount > 0 ? ((searchRequest.page || 1) - 1) * (searchRequest.pageSize || 50) + 1 : 0} -{" "}
          {Math.min((searchRequest.page || 1) * (searchRequest.pageSize || 50), totalCount)} 件を表示
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={(searchRequest.page || 1) === 1}
            className="gap-1"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((searchRequest.page || 1) - 1)}
            disabled={(searchRequest.page || 1) === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>
          <span className="text-sm text-foreground">
            {searchRequest.page || 1} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((searchRequest.page || 1) + 1)}
            disabled={(searchRequest.page || 1) >= totalPages}
            className="gap-1"
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={(searchRequest.page || 1) >= totalPages}
            className="gap-1"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 登録/編集ダイアログ */}
      <MetricDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        metric={selectedMetric}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
