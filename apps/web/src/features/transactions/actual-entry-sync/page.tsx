"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { ArrowLeft, Loader2, Save, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/ui"
import type { ActualBffClient } from "./api/BffClient"
import { MockActualBffClient } from "./api/MockBffClient"
import type {
  BffActualGridResponse,
  BffActualContextResponse,
  BffAffectedRow,
  SourceType,
} from "@epm/contracts/bff/actual-entry"

// Dynamic import for Syncfusion TreeGrid (SSR disabled)
const TreeGridActualGrid = dynamic(
  () => import("./ui/TreeGridActualGrid").then((mod) => ({ default: mod.TreeGridActualGrid })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

// ============================================
// Types
// ============================================

interface ActualEntryPageProps {
  client?: ActualBffClient
}

// ============================================
// Component
// ============================================

export function ActualEntryPage({ client }: ActualEntryPageProps) {
  const bffClient = React.useMemo(() => client ?? new MockActualBffClient(), [client])

  // State
  const [contextData, setContextData] = React.useState<BffActualContextResponse | null>(null)
  const [gridData, setGridData] = React.useState<BffActualGridResponse | null>(null)

  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState<number | null>(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | null>(null)

  // 調整行トグル（デフォルトOFF）
  const [showAdjustmentBreakdown, setShowAdjustmentBreakdown] = React.useState(false)

  const [isLoadingContext, setIsLoadingContext] = React.useState(true)
  const [isLoadingGrid, setIsLoadingGrid] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load context on mount
  React.useEffect(() => {
    const loadContext = async () => {
      try {
        setIsLoadingContext(true)
        const contextResponse = await bffClient.getContext()
        setContextData(contextResponse)

        // Set initial defaults
        if (contextResponse.fiscalYears.length > 0) {
          setSelectedFiscalYear(contextResponse.fiscalYears[0].value)
        }
        if (contextResponse.departments.length > 0) {
          setSelectedDepartmentId(contextResponse.departments[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "コンテキストの読み込みに失敗しました")
      } finally {
        setIsLoadingContext(false)
      }
    }

    loadContext()
  }, [bffClient])

  // Load grid data when context changes
  React.useEffect(() => {
    if (!selectedFiscalYear || !selectedDepartmentId) {
      return
    }

    const loadGrid = async () => {
      try {
        setIsLoadingGrid(true)
        setError(null)

        const data = await bffClient.getGrid({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
        })
        setGridData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの読み込みに失敗しました")
      } finally {
        setIsLoadingGrid(false)
      }
    }

    loadGrid()
  }, [bffClient, selectedFiscalYear, selectedDepartmentId])

  const handleCellChange = async (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null,
    sourceType: SourceType
  ): Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }> => {
    if (!selectedFiscalYear || !selectedDepartmentId) {
      return { success: false, error: "コンテキストが選択されていません" }
    }

    try {
      const result = await bffClient.updateCell(
        {
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
        },
        {
          subjectId,
          periodId,
          dimensionValueId: dimensionValueId ?? undefined,
          value,
          sourceType,
        }
      )

      return {
        success: result.success,
        affectedRows: result.affectedRows,
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "保存に失敗しました",
      }
    }
  }

  // 月状態のサマリー表示
  const getMonthStatusSummary = () => {
    if (!gridData) return null
    const periods = gridData.periods.filter((p) => p.periodType === "MONTH")
    const hardClosed = periods.filter((p) => p.monthStatus === "HARD_CLOSED").length
    const softClosed = periods.filter((p) => p.monthStatus === "SOFT_CLOSED").length
    const open = periods.filter((p) => p.monthStatus === "OPEN").length
    const future = periods.filter((p) => p.monthStatus === "FUTURE").length

    return { hardClosed, softClosed, open, future }
  }

  const monthStatusSummary = getMonthStatusSummary()

  if (isLoadingContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full bg-background p-4">
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/transactions">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">実績入力 (SyV)</h1>
              <p className="text-sm text-muted-foreground mt-1">
                月次実績を入力・管理します（Syncfusion TreeGrid版）
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gridData?.context && (
              <>
                {gridData.context.isEditable && (
                  <Badge variant="outline" className="text-success border-success">
                    <Save className="h-3 w-3 mr-1" />
                    編集可能
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Context Selector */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-end gap-6">
              {/* 年度 */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fiscal-year" className="text-xs text-muted-foreground">
                  年度
                </Label>
                <Select
                  value={selectedFiscalYear?.toString() ?? ""}
                  onValueChange={(value) => setSelectedFiscalYear(parseInt(value, 10))}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="fiscal-year" className="w-[140px]">
                    <SelectValue placeholder="年度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contextData?.fiscalYears.map((fy) => (
                      <SelectItem key={fy.value} value={fy.value.toString()}>
                        {fy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 部門 */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="department" className="text-xs text-muted-foreground">
                  部門
                </Label>
                <Select
                  value={selectedDepartmentId ?? ""}
                  onValueChange={setSelectedDepartmentId}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="department" className="w-[180px]">
                    <SelectValue placeholder="部門を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contextData?.departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 調整行トグル */}
              <div className="flex items-center gap-2 ml-auto">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="adjustment-toggle" className="text-sm">
                  調整内訳を表示
                </Label>
                <Switch
                  id="adjustment-toggle"
                  checked={showAdjustmentBreakdown}
                  onCheckedChange={setShowAdjustmentBreakdown}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month Status Summary */}
        {monthStatusSummary && (
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground">月状態:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-300" />
                    <span className="text-sm">確定 {monthStatusSummary.hardClosed}ヶ月</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-yellow-200" />
                    <span className="text-sm">仮締め {monthStatusSummary.softClosed}ヶ月</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border" />
                    <span className="text-sm">入力中 {monthStatusSummary.open}ヶ月</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-100" />
                    <span className="text-sm">未経過 {monthStatusSummary.future}ヶ月</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Actual Grid */}
        {isLoadingGrid ? (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : gridData ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">実績データ</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {gridData.context.departmentName} / {gridData.context.fiscalYear}年度
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-blue-200/50">
                <CardHeader className="py-2 px-4 bg-blue-50/30">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    実績 ({gridData.context.fiscalYear}年度)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TreeGridActualGrid
                    periods={gridData.periods}
                    rows={gridData.rows}
                    isEditable={gridData.context.isEditable}
                    showAdjustmentBreakdown={showAdjustmentBreakdown}
                    onCellChange={handleCellChange}
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
