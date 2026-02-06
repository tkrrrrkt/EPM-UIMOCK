"use client"

import { useMemo, useCallback, useRef, useEffect, useState } from "react"
import type { ColDef, CellValueChangedEvent, ValueGetterParams } from "ag-grid-community"
import { Card, CardContent, CardHeader, CardTitle, Skeleton, useToast } from "@/shared/ui"
import { EditableAmountGrid, type MtpAmountRowData, type PendingChange, amountValueFormatter, amountValueParser } from "@/shared/ag-grid"
import { MockBffClient } from "../api/mock-bff-client"
import type { BffMtpAmountsResponse, BffMtpAmountCell } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface MtpAmountGridProps {
  eventId: string
  dimensionValueId: string
  data: BffMtpAmountsResponse
  loading: boolean
  onReload: () => void
}

/**
 * MTP 数値入力グリッド（AG-Grid版）
 *
 * 機能:
 * - Excelライクなコピー＆ペースト
 * - 範囲選択
 * - キーボードナビゲーション（Tab, Enter, 矢印キー）
 * - 500msデバウンス自動保存
 * - 実績列は読み取り専用、計画列は編集可能
 * - 集計行は編集不可
 */
export function MtpAmountGrid({ eventId, dimensionValueId, data, loading, onReload }: MtpAmountGridProps) {
  const { toast } = useToast()
  const pendingSavesRef = useRef<Map<string, BffMtpAmountCell>>(new Map())
  const [localAmounts, setLocalAmounts] = useState<Map<string, string>>(new Map())

  // APIレスポンスをAG-Grid用の行データに変換
  const rowData = useMemo<MtpAmountRowData[]>(() => {
    return data.subjects.map((subject) => {
      const row: MtpAmountRowData = {
        id: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        isAggregate: subject.isAggregate,
        indentLevel: subject.indentLevel,
        treePath: subject.treePath,
      }

      // 各年度の金額を動的フィールドとして追加
      data.columns.forEach((col) => {
        const fieldName = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`

        // ローカル変更を優先
        const key = `${subject.id}-${col.fiscalYear}`
        if (localAmounts.has(key)) {
          row[fieldName] = parseFloat(localAmounts.get(key) || "0")
        } else {
          const amount = data.amounts.find((a) => a.subjectId === subject.id && a.fiscalYear === col.fiscalYear)
          row[fieldName] = parseFloat(amount?.amount || "0")
        }
      })

      return row
    })
  }, [data, localAmounts])

  // 計画列のフィールド名リスト
  const planFields = useMemo(() => {
    return data.columns.filter((c) => !c.isActual).map((c) => `plan_${c.fiscalYear}`)
  }, [data.columns])

  // ツリーパス取得コールバック
  const getDataPath = useCallback((row: MtpAmountRowData) => {
    return row.treePath || [row.subjectName]
  }, [])

  // 列定義（科目名列はautoGroupColumnDefで自動生成）
  const columnDefs = useMemo<ColDef<MtpAmountRowData>[]>(() => {
    const cols: ColDef<MtpAmountRowData>[] = []

    // 年度列を追加
    data.columns.forEach((col) => {
      const fieldName = col.isActual ? `actual_${col.fiscalYear}` : `plan_${col.fiscalYear}`
      const isEditable = !col.isActual && !data.isReadOnly

      cols.push({
        field: fieldName,
        headerName: `FY${col.fiscalYear}\n${col.isActual ? "実績" : "計画"}`,
        width: 120,
        editable: (params) => {
          if (!isEditable) return false
          if (params.data?.isAggregate) return false
          return true
        },
        valueFormatter: amountValueFormatter,
        valueParser: amountValueParser,
        cellClass: (params) => {
          const classes: string[] = ["tabular-nums"]
          if (col.isActual) {
            classes.push("bg-muted", "text-muted-foreground")
          }
          if (params.data?.isAggregate) {
            classes.push("font-semibold")
          }
          return classes.join(" ")
        },
        cellStyle: (params) => {
          const style: Record<string, string> = { textAlign: "right" }
          if (col.isActual) {
            style.backgroundColor = "hsl(var(--muted))"
            style.color = "hsl(var(--muted-foreground))"
          }
          return style
        },
      })
    })

    // 計画合計列
    cols.push({
      headerName: "計画合計",
      width: 120,
      editable: false,
      valueGetter: (params: ValueGetterParams<MtpAmountRowData>) => {
        if (!params.data) return 0
        return planFields.reduce((sum, field) => {
          const value = params.data?.[field]
          if (value === null || value === undefined) return sum
          const num = typeof value === "string" ? parseFloat(value) : (value as number)
          if (isNaN(num)) return sum
          return sum + num
        }, 0)
      },
      valueFormatter: amountValueFormatter,
      cellClass: "font-semibold tabular-nums",
      cellStyle: {
        textAlign: "right",
        backgroundColor: "hsl(var(--muted) / 0.5)",
      },
    })

    return cols
  }, [data.columns, data.isReadOnly, planFields])

  // セル値変更時の処理
  const handleCellValueChanged = useCallback(
    (change: PendingChange) => {
      // ローカル状態を更新
      const fiscalYear = change.field.replace(/^plan_/, "")
      const key = `${change.rowId}-${fiscalYear}`

      setLocalAmounts((prev) => {
        const updated = new Map(prev)
        updated.set(key, change.newValue)
        return updated
      })

      // 保留中の保存リストに追加
      pendingSavesRef.current.set(key, {
        subjectId: change.rowId,
        fiscalYear: parseInt(fiscalYear, 10),
        amount: change.newValue,
        isActual: false,
      })
    },
    []
  )

  // 変更を保存
  const handleSaveChanges = useCallback(
    async (changes: PendingChange[]) => {
      if (pendingSavesRef.current.size === 0) return

      const amounts = Array.from(pendingSavesRef.current.values())

      try {
        await bffClient.saveAmounts(eventId, {
          dimensionValueId: dimensionValueId === "dv-all" ? "" : dimensionValueId,
          amounts,
        })
        pendingSavesRef.current.clear()
        // リロードはせずにローカル状態で表示を維持
      } catch (error) {
        toast({
          title: "保存エラー",
          description: "数値の保存に失敗しました",
          variant: "destructive",
        })
      }
    },
    [eventId, dimensionValueId, toast]
  )

  // ローディング中
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>数値入力グリッド</span>
          {data.isReadOnly && <span className="text-sm font-normal text-muted-foreground">（読み取り専用）</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <EditableAmountGrid<MtpAmountRowData>
          rowData={rowData}
          columnDefs={columnDefs}
          isReadOnly={data.isReadOnly}
          autoSaveDelay={500}
          height={Math.min(600, 100 + data.subjects.length * 36)}
          onCellValueChanged={handleCellValueChanged}
          onSaveChanges={handleSaveChanges}
          getRowId={(data) => data.id}
          treeData={true}
          getDataPath={getDataPath}
          groupDefaultExpanded={1}
        />
      </CardContent>
    </Card>
  )
}
