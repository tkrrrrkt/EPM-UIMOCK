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
import { KpiDefinitionDetailDialog } from "./KpiDefinitionDetailDialog"
import { bffClient } from "../api/client"
import type {
  BffKpiDefinitionSummary,
  BffKpiDefinitionDetailResponse,
  BffListKpiDefinitionsRequest,
  AggregationMethod,
  Direction,
} from "@epm/contracts/bff/kpi-definitions"

/**
 * KPI定義マスタ一覧ページ
 * SSoT: .kiro/specs/master-data/kpi-definitions/design.md
 */
export function KpiDefinitionsListPage() {
  const [kpiDefinitions, setKpiDefinitions] = useState<BffKpiDefinitionSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const [searchRequest, setSearchRequest] = useState<BffListKpiDefinitionsRequest>({
    keyword: "",
    aggregationMethod: undefined,
    isActive: undefined,
    page: 1,
    pageSize: 50,
    sortBy: "kpiCode",
    sortOrder: "asc",
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedKpiDefinition, setSelectedKpiDefinition] = useState<BffKpiDefinitionDetailResponse | null>(null)

  // 総ページ数を計算
  const totalPages = Math.ceil(totalCount / (searchRequest.pageSize || 50))

  const fetchKpiDefinitions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await bffClient.listKpiDefinitions(searchRequest)
      setKpiDefinitions(response.items)
      setTotalCount(response.totalCount)
    } catch (error) {
      console.error("Failed to fetch KPI definitions:", error)
    } finally {
      setLoading(false)
    }
  }, [searchRequest])

  useEffect(() => {
    fetchKpiDefinitions()
  }, [fetchKpiDefinitions])

  const handleSearch = () => {
    setSearchRequest((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setSearchRequest((prev) => ({ ...prev, page: newPage }))
  }

  const handleSort = (sortBy: "kpiCode" | "kpiName" | "aggregationMethod") => {
    setSearchRequest((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const handleCreate = () => {
    setSelectedKpiDefinition(null)
    setDialogOpen(true)
  }

  const handleEdit = async (kpiDef: BffKpiDefinitionSummary) => {
    try {
      // 詳細取得して編集ダイアログを開く
      const detail = await bffClient.getKpiDefinitionById(kpiDef.id)
      setSelectedKpiDefinition(detail)
      setDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch KPI definition detail:", error)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await bffClient.deactivateKpiDefinition(id)
      fetchKpiDefinitions()
    } catch (error) {
      console.error("Failed to deactivate KPI definition:", error)
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await bffClient.reactivateKpiDefinition(id)
      fetchKpiDefinitions()
    } catch (error) {
      console.error("Failed to reactivate KPI definition:", error)
    }
  }

  const handleDialogSuccess = () => {
    setDialogOpen(false)
    fetchKpiDefinitions()
  }

  // 集計方法の表示名
  const getAggregationMethodLabel = (method: AggregationMethod): string => {
    switch (method) {
      case "SUM":
        return "合計"
      case "EOP":
        return "期末値"
      case "AVG":
        return "平均"
      case "MAX":
        return "最大"
      case "MIN":
        return "最小"
      default:
        return method
    }
  }

  // 方向性の表示名
  const getDirectionLabel = (direction: Direction | null): string => {
    if (!direction) return "-"
    switch (direction) {
      case "higher_is_better":
        return "高↑"
      case "lower_is_better":
        return "低↓"
      default:
        return direction
    }
  }

  // 方向性のバリアント
  const getDirectionVariant = (direction: Direction | null): "default" | "secondary" | "outline" => {
    if (!direction) return "outline"
    return direction === "higher_is_better" ? "default" : "secondary"
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">KPI定義マスタ</h1>
          <p className="text-sm text-muted-foreground">非財務KPI定義の登録・編集・管理</p>
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
              placeholder="KPIコード、KPI名で検索"
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
            value={searchRequest.aggregationMethod || "all"}
            onValueChange={(value) =>
              setSearchRequest((prev) => ({
                ...prev,
                aggregationMethod: value === "all" ? undefined : (value as AggregationMethod),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="集計方法" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="SUM">合計 (SUM)</SelectItem>
              <SelectItem value="EOP">期末値 (EOP)</SelectItem>
              <SelectItem value="AVG">平均 (AVG)</SelectItem>
              <SelectItem value="MAX">最大 (MAX)</SelectItem>
              <SelectItem value="MIN">最小 (MIN)</SelectItem>
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
              <TableHead className="cursor-pointer" onClick={() => handleSort("kpiCode")}>
                KPIコード {searchRequest.sortBy === "kpiCode" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("kpiName")}>
                KPI名 {searchRequest.sortBy === "kpiName" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>単位</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("aggregationMethod")}>
                集計方法 {searchRequest.sortBy === "aggregationMethod" && (searchRequest.sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>方向性</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : kpiDefinitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  KPI定義が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              kpiDefinitions.map((kpiDef) => (
                <TableRow key={kpiDef.id}>
                  <TableCell className="font-medium">{kpiDef.kpiCode}</TableCell>
                  <TableCell>{kpiDef.kpiName}</TableCell>
                  <TableCell>{kpiDef.unit || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAggregationMethodLabel(kpiDef.aggregationMethod)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDirectionVariant(kpiDef.direction)}>
                      {getDirectionLabel(kpiDef.direction)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={kpiDef.isActive ? "default" : "secondary"}>
                      {kpiDef.isActive ? "有効" : "無効"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(kpiDef)}>
                        編集
                      </Button>
                      {kpiDef.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(kpiDef.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          無効化
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivate(kpiDef.id)}
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
      <KpiDefinitionDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kpiDefinition={selectedKpiDefinition}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

export default KpiDefinitionsListPage
