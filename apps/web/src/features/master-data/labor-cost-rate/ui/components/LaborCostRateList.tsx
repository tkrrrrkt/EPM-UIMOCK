"use client"

import { useState, useEffect } from "react"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import type { BffListLaborCostRatesRequest, BffLaborCostRateSummary } from "../types/bff-contracts"
import { getErrorMessage } from "../lib/error-messages"
import { formatTotalRate, formatDate, getRateTypeLabel, getResourceTypeLabel } from "../lib/format"
import { Plus } from "lucide-react"
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Alert,
  AlertDescription,
} from "@/shared/ui"

interface LaborCostRateListProps {
  onViewDetail: (id: string) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
  onCreateNew: () => void
  searchParams: BffListLaborCostRatesRequest
}

export function LaborCostRateList({
  onViewDetail,
  onDeactivate,
  onReactivate,
  onCreateNew,
  searchParams,
}: LaborCostRateListProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rates, setRates] = useState<BffLaborCostRateSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  useEffect(() => {
    loadRates()
  }, [searchParams, currentPage])

  async function loadRates() {
    try {
      setLoading(true)
      setError(null)
      const response = await client.listLaborCostRates({
        ...searchParams,
        page: currentPage,
        pageSize,
      })
      setRates(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("データの取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 ? `${totalCount}件の単価` : "単価が見つかりません"}
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          新規登録
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">単価コード</TableHead>
                <TableHead className="w-[70px]">区分</TableHead>
                <TableHead className="w-[100px]">職種</TableHead>
                <TableHead className="w-[80px]">等級</TableHead>
                <TableHead className="w-[140px]">外注先/雇用</TableHead>
                <TableHead className="w-[90px]">単価種別</TableHead>
                <TableHead className="w-[120px] text-right">合計単価</TableHead>
                <TableHead className="w-[110px]">有効開始日</TableHead>
                <TableHead className="w-[110px]">有効終了日</TableHead>
                <TableHead className="w-[70px]">状態</TableHead>
                <TableHead className="w-[130px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    検索条件に一致する単価がありません
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((rate) => (
                  <TableRow key={rate.id} className={!rate.isActive ? "opacity-50" : ""}>
                    <TableCell className="font-mono">{rate.rateCode}</TableCell>
                    <TableCell>
                      <Badge variant={rate.resourceType === "EMPLOYEE" ? "outline" : "secondary"}>
                        {getResourceTypeLabel(rate.resourceType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{rate.jobCategory}</TableCell>
                    <TableCell>{rate.grade || "-"}</TableCell>
                    <TableCell>
                      {rate.resourceType === "CONTRACTOR" ? rate.vendorName || "-" : rate.employmentType || "-"}
                    </TableCell>
                    <TableCell>{getRateTypeLabel(rate.rateType)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatTotalRate(rate.totalRate, rate.rateType)}
                    </TableCell>
                    <TableCell>{formatDate(rate.effectiveDate)}</TableCell>
                    <TableCell>{formatDate(rate.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant={rate.isActive ? "default" : "secondary"}>{rate.isActive ? "有効" : "無効"}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetail(rate.id)}>
                        詳細
                      </Button>
                      {rate.isActive ? (
                        <Button variant="ghost" size="sm" onClick={() => onDeactivate(rate.id)}>
                          無効化
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onReactivate(rate.id)}>
                          再有効化
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            前へ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
          </div>
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}
