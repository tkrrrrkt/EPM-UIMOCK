"use client"

import { useEffect, useState } from "react"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import type { BffLaborCostRateDetailResponse } from "../types/bff-contracts"
import { getErrorMessage } from "../lib/error-messages"
import {
  formatTotalRate,
  formatDate,
  getRateTypeLabel,
  getResourceTypeLabel,
  formatAmount,
  formatPercentage,
} from "../lib/format"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui"

interface DetailDialogProps {
  rateId: string | null
  open: boolean
  onClose: () => void
  onEdit: (id: string) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function DetailDialog({ rateId, open, onClose, onEdit, onDeactivate, onReactivate }: DetailDialogProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rate, setRate] = useState<BffLaborCostRateDetailResponse | null>(null)

  useEffect(() => {
    if (open && rateId) {
      loadDetail()
    } else {
      setRate(null)
      setError(null)
    }
  }, [open, rateId])

  async function loadDetail() {
    if (!rateId) return

    try {
      setLoading(true)
      setError(null)
      const detail = await client.getLaborCostRateDetail(rateId)
      setRate(detail)
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("詳細情報の取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>単価詳細</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
        ) : rate ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">単価コード</div>
                <div className="font-mono">{rate.rateCode}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">状態</div>
                <Badge variant={rate.isActive ? "default" : "secondary"}>{rate.isActive ? "有効" : "無効"}</Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">リソース区分</div>
                <Badge variant={rate.resourceType === "EMPLOYEE" ? "outline" : "secondary"}>
                  {getResourceTypeLabel(rate.resourceType)}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {rate.resourceType === "CONTRACTOR" ? "外注先名" : "雇用区分"}
                </div>
                <div>
                  {rate.resourceType === "CONTRACTOR"
                    ? rate.vendorName || "-"
                    : rate.employmentType || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">職種</div>
                <div>{rate.jobCategory}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">等級</div>
                <div>{rate.grade || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">単価種別</div>
                <div>{getRateTypeLabel(rate.rateType)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">合計単価</div>
                <div className="font-mono text-lg">{formatTotalRate(rate.totalRate, rate.rateType)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">有効開始日</div>
                <div>{formatDate(rate.effectiveDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">有効終了日</div>
                <div>{formatDate(rate.expiryDate)}</div>
              </div>
            </div>

            {/* Item breakdown section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">科目別内訳</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>科目コード</TableHead>
                      <TableHead>科目名</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">構成比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rate.items
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.subjectCode}</TableCell>
                          <TableCell>{item.subjectName}</TableCell>
                          <TableCell className="text-right font-mono">{formatAmount(item.amount)}</TableCell>
                          <TableCell className="text-right font-mono">{formatPercentage(item.percentage)}</TableCell>
                        </TableRow>
                      ))}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell colSpan={2}>合計</TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(rate.totalRate)}</TableCell>
                      <TableCell className="text-right font-mono">100.00%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">備考</div>
                <div className="text-sm">{rate.notes || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">作成日時</div>
                <div className="text-sm">{new Date(rate.createdAt).toLocaleString("ja-JP")}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">更新日時</div>
                <div className="text-sm">{new Date(rate.updatedAt).toLocaleString("ja-JP")}</div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {rate && (
            <>
              <Button variant="outline" onClick={() => onEdit(rate.id)}>
                編集
              </Button>
              {rate.isActive ? (
                <Button variant="destructive" onClick={() => onDeactivate(rate.id)}>
                  無効化
                </Button>
              ) : (
                <Button onClick={() => onReactivate(rate.id)}>再有効化</Button>
              )}
            </>
          )}
          <Button variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
