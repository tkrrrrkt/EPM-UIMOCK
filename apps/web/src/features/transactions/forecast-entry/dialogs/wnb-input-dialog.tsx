"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui"
import { cn } from "@/lib/utils"
import type {
  BffWnbDialogResponse,
  BffWnbPeriod,
  BffWnbValue,
} from "@epm/contracts/bff/forecast-wnb"

// ============================================
// Types
// ============================================

interface WnbInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: BffWnbDialogResponse | null
  onSave: (values: BffWnbValue[]) => Promise<{ success: boolean; error?: string }>
}

interface EditableValues {
  [periodNo: number]: {
    worst: string
    normal: string
    best: string
  }
}

// ============================================
// Component
// ============================================

export function WnbInputDialog({ open, onOpenChange, data, onSave }: WnbInputDialogProps) {
  const [editableValues, setEditableValues] = React.useState<EditableValues>({})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // データが変更されたら編集値を初期化
  React.useEffect(() => {
    if (data) {
      const initialValues: EditableValues = {}
      data.periods.forEach((period) => {
        if (period.isWnbEnabled) {
          initialValues[period.periodNo] = {
            worst: period.worst ?? "",
            normal: period.normal,
            best: period.best ?? "",
          }
        }
      })
      setEditableValues(initialValues)
    }
  }, [data])

  if (!data) return null

  const handleValueChange = (
    periodNo: number,
    field: "worst" | "normal" | "best",
    value: string
  ) => {
    setEditableValues((prev) => ({
      ...prev,
      [periodNo]: {
        ...prev[periodNo],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const values: BffWnbValue[] = data.periods
      .filter((p) => p.isWnbEnabled)
      .map((period) => {
        const edited = editableValues[period.periodNo]
        return {
          periodNo: period.periodNo,
          worst: edited?.worst || null,
          normal: edited?.normal || period.normal,
          best: edited?.best || null,
        }
      })

    const result = await onSave(values)

    if (result.success) {
      onOpenChange(false)
    } else {
      setError(result.error ?? "保存に失敗しました")
    }

    setSaving(false)
  }

  // 通期合計を計算
  const calculateAnnual = (field: "worst" | "normal" | "best"): string => {
    let sum = 0
    data.periods.forEach((period) => {
      if (period.isWnbEnabled) {
        const edited = editableValues[period.periodNo]
        const value = edited?.[field] || (field === "normal" ? period.normal : null)
        if (value) {
          sum += parseFloat(value) || 0
        }
      } else {
        // W/N/B対象外の月はノーマル値を使用
        sum += parseFloat(period.normal) || 0
      }
    })
    return sum.toLocaleString("ja-JP")
  }

  const formatAmount = (value: string | null): string => {
    if (!value) return ""
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return num.toLocaleString("ja-JP")
  }

  // W/N/B対象期間のみ表示
  const wnbPeriods = data.periods.filter((p) => p.isWnbEnabled)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[1600px] sm:!max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {data.subjectName} - シナリオ入力
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-[160px] text-base">シナリオ</TableHead>
                  {wnbPeriods.map((period) => (
                    <TableHead
                      key={period.periodNo}
                      className={cn(
                        "text-center min-w-[140px] text-base",
                        !period.isEditable && "bg-muted"
                      )}
                    >
                      {period.periodLabel}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[160px] bg-amber-50 font-bold text-base">
                    通期
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ワースト行 */}
                <TableRow className="bg-red-50/30">
                  <TableCell className="font-medium text-base">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-red-500" />
                      ワースト
                    </div>
                  </TableCell>
                  {wnbPeriods.map((period) => {
                    const edited = editableValues[period.periodNo]
                    return (
                      <TableCell key={period.periodNo} className="p-2">
                        {period.isEditable ? (
                          <Input
                            type="text"
                            value={edited?.worst ?? ""}
                            onChange={(e) =>
                              handleValueChange(period.periodNo, "worst", e.target.value)
                            }
                            placeholder="未入力"
                            className="h-12 text-right text-base min-w-[120px]"
                          />
                        ) : (
                          <div className="h-12 px-3 flex items-center justify-end text-base text-muted-foreground">
                            {formatAmount(period.worst)}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-right font-mono bg-amber-50 text-base px-4">
                    {calculateAnnual("worst")}
                  </TableCell>
                </TableRow>

                {/* ノーマル行 */}
                <TableRow className="bg-gray-50/30">
                  <TableCell className="font-medium text-base">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-gray-500" />
                      ノーマル
                    </div>
                  </TableCell>
                  {wnbPeriods.map((period) => {
                    const edited = editableValues[period.periodNo]
                    return (
                      <TableCell key={period.periodNo} className="p-2">
                        {period.isEditable ? (
                          <Input
                            type="text"
                            value={edited?.normal ?? period.normal}
                            onChange={(e) =>
                              handleValueChange(period.periodNo, "normal", e.target.value)
                            }
                            className="h-12 text-right text-base min-w-[120px]"
                          />
                        ) : (
                          <div className="h-12 px-3 flex items-center justify-end text-base text-muted-foreground">
                            {formatAmount(period.normal)}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-right font-mono bg-amber-50 font-medium text-base px-4">
                    {calculateAnnual("normal")}
                  </TableCell>
                </TableRow>

                {/* ベスト行 */}
                <TableRow className="bg-green-50/30">
                  <TableCell className="font-medium text-base">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-green-500" />
                      ベスト
                    </div>
                  </TableCell>
                  {wnbPeriods.map((period) => {
                    const edited = editableValues[period.periodNo]
                    return (
                      <TableCell key={period.periodNo} className="p-2">
                        {period.isEditable ? (
                          <Input
                            type="text"
                            value={edited?.best ?? ""}
                            onChange={(e) =>
                              handleValueChange(period.periodNo, "best", e.target.value)
                            }
                            placeholder="未入力"
                            className="h-12 text-right text-base min-w-[120px]"
                          />
                        ) : (
                          <div className="h-12 px-3 flex items-center justify-end text-base text-muted-foreground">
                            {formatAmount(period.best)}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-right font-mono bg-amber-50 text-base px-4">
                    {calculateAnnual("best")}
                  </TableCell>
                </TableRow>

                {/* 予算行（参考表示） */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium text-muted-foreground text-base">
                    予算（参考）
                  </TableCell>
                  {wnbPeriods.map((period) => (
                    <TableCell key={period.periodNo} className="text-right text-base text-muted-foreground px-4">
                      {formatAmount(period.budget)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-mono text-muted-foreground bg-amber-50/50 text-base px-4">
                    {formatAmount(data.annualSummary.budget)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            ※ ワースト/ベストが未入力の場合、ノーマル値が使用されます
          </p>
          <p className="text-xs text-muted-foreground">
            ※ ノーマル値を変更すると、見込入力グリッドの値も更新されます
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
