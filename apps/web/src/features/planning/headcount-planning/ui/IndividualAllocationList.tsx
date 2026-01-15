"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import { formatAmount, formatPercentage, formatRate } from "../lib/format"
import type {
  BffListIndividualAllocationsRequest,
  BffIndividualAllocationSummary,
  BffListIndividualAllocationsResponse,
} from "@epm/contracts/bff/headcount-planning"
import type { SearchParams } from "./SearchPanel"

interface IndividualAllocationListProps {
  searchParams: SearchParams | null
  onCreateNew: () => void
  onEdit: (individual: BffIndividualAllocationSummary) => void
  onDelete: (individualKey: string) => void
}

export function IndividualAllocationList({
  searchParams,
  onCreateNew,
  onEdit,
  onDelete,
}: IndividualAllocationListProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BffListIndividualAllocationsResponse | null>(null)

  const loadData = useCallback(async () => {
    if (!searchParams) return

    try {
      setLoading(true)
      setError(null)

      const request: BffListIndividualAllocationsRequest = {
        companyId: searchParams.companyId,
        planEventId: searchParams.planEventId,
        planVersionId: searchParams.planVersionId,
        sourceDepartmentStableId: searchParams.sourceDepartmentStableId,
      }

      const response = await client.listIndividualAllocations(request)
      setData(response)
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("データの取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }, [client, searchParams])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!searchParams) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">個人別配賦管理（役員・兼務者）</CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            個人追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            個人別配賦がありません。「個人追加」ボタンから登録してください。
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">氏名</TableHead>
                  <TableHead className="w-24">職種</TableHead>
                  <TableHead className="w-20">等級</TableHead>
                  <TableHead className="w-28 text-right">単価（月）</TableHead>
                  <TableHead className="w-28">配賦先</TableHead>
                  <TableHead className="w-20 text-right">配賦率</TableHead>
                  <TableHead className="w-28 text-right">年間金額</TableHead>
                  <TableHead className="w-20 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((individual) =>
                  individual.allocations.map((allocation, index) => (
                    <TableRow
                      key={`${individual.individualKey}-${allocation.id}`}
                      className="hover:bg-muted/30"
                    >
                      {index === 0 && (
                        <>
                          <TableCell
                            rowSpan={individual.allocations.length}
                            className="font-semibold"
                          >
                            <div className="flex items-center gap-2">
                              {individual.individualName}
                              {individual.employeeStableId && (
                                <Badge variant="outline" className="text-xs">
                                  社員
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell rowSpan={individual.allocations.length}>
                            {individual.jobCategory}
                          </TableCell>
                          <TableCell rowSpan={individual.allocations.length}>
                            {individual.grade ?? "-"}
                          </TableCell>
                          <TableCell
                            rowSpan={individual.allocations.length}
                            className="text-right font-mono"
                          >
                            {individual.rate
                              ? formatRate(individual.rate.totalRate, individual.rate.rateType)
                              : individual.customRate
                              ? formatAmount(individual.customRate)
                              : "-"}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{allocation.targetDepartment.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatPercentage(allocation.percentage)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(allocation.annualAmount)}
                      </TableCell>
                      {index === 0 && (
                        <TableCell
                          rowSpan={individual.allocations.length}
                          className="text-center"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onEdit(individual)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => onDelete(individual.individualKey)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {data && data.summary && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>個人配賦 {data.summary.individualCount}名</span>
              <span className="font-semibold text-foreground">
                合計: {formatAmount(data.summary.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
