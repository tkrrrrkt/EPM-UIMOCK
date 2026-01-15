"use client"

import * as React from "react"
import { ArrowLeft, Loader2, Save, TrendingUp, GitCompare, Plus } from "lucide-react"
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/ui"
import { ForecastGrid } from "./ui/ForecastGrid"
import { ForecastGridWithConfidence } from "./ui/ForecastGridWithConfidence"
import { AchievementRatePanel } from "./ui/AchievementRatePanel"
import { BudgetCompareGrid } from "./ui/BudgetCompareGrid"
import { PreviousForecastCompareGrid } from "./ui/PreviousForecastCompareGrid"
import { SubjectFilter } from "./ui/SubjectFilter"
import { WnbInputDialog } from "./dialogs/wnb-input-dialog"
import type { ForecastBffClient } from "./api/BffClient"
import { MockForecastBffClient, type ForecastRowWithConfidence } from "./api/MockBffClient"
import type {
  BffForecastGridResponse,
  BffForecastContextResponse,
  BffForecastBudgetCompareResponse,
  BffForecastPreviousCompareResponse,
  BffAffectedRow,
  BffSubjectSummary,
} from "@epm/contracts/bff/forecast-entry"
import type { BffConfidenceLevel } from "@epm/contracts/bff/confidence-master"
import type { BffWnbDialogResponse, BffWnbValue } from "@epm/contracts/bff/forecast-wnb"

// ============================================
// Types
// ============================================

type CompareMode = "none" | "budget" | "previous"

interface ForecastEntryPageProps {
  client?: ForecastBffClient
}

// ============================================
// Component
// ============================================

export function ForecastEntryPage({ client }: ForecastEntryPageProps) {
  const bffClient = React.useMemo(() => client ?? new MockForecastBffClient(), [client])

  // State
  const [contextData, setContextData] = React.useState<BffForecastContextResponse | null>(null)
  const [gridData, setGridData] = React.useState<BffForecastGridResponse | null>(null)
  const [subjects, setSubjects] = React.useState<BffSubjectSummary[]>([])

  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState<number | null>(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | null>(null)
  const [selectedForecastEventId, setSelectedForecastEventId] = React.useState<string | null>(null)
  const [selectedForecastVersionId, setSelectedForecastVersionId] = React.useState<string | null>(null)

  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<string[]>([])
  const [showAchievementDetails, setShowAchievementDetails] = React.useState(false)

  // 確度・W/N/B関連の状態
  const [confidenceLevels, setConfidenceLevels] = React.useState<BffConfidenceLevel[]>([])
  const [wnbStartPeriodNo, setWnbStartPeriodNo] = React.useState<number | null>(null)
  const [useConfidenceGrid, setUseConfidenceGrid] = React.useState(true) // 確度対応グリッドを使用

  // W/N/Bダイアログ
  const [wnbDialogOpen, setWnbDialogOpen] = React.useState(false)
  const [wnbDialogData, setWnbDialogData] = React.useState<BffWnbDialogResponse | null>(null)

  // 比較モード
  const [compareMode, setCompareMode] = React.useState<CompareMode>("none")

  // 予算対比用
  const [compareBudgetVersionId, setCompareBudgetVersionId] = React.useState<string | null>(null)
  const [budgetCompareData, setBudgetCompareData] = React.useState<BffForecastBudgetCompareResponse | null>(null)
  const [isLoadingBudgetCompare, setIsLoadingBudgetCompare] = React.useState(false)

  // 前回見込対比用
  const [comparePreviousVersionId, setComparePreviousVersionId] = React.useState<string | null>(null)
  const [previousCompareData, setPreviousCompareData] = React.useState<BffForecastPreviousCompareResponse | null>(null)
  const [isLoadingPreviousCompare, setIsLoadingPreviousCompare] = React.useState(false)

  const [isLoadingContext, setIsLoadingContext] = React.useState(true)
  const [isLoadingGrid, setIsLoadingGrid] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load context on mount
  React.useEffect(() => {
    const loadContext = async () => {
      try {
        setIsLoadingContext(true)
        const [contextResponse, subjectsResponse] = await Promise.all([
          bffClient.getContext(),
          bffClient.getSubjects(),
        ])
        setContextData(contextResponse)
        setSubjects(subjectsResponse.subjects)

        // 確度・W/N/B設定を取得（MockBffClient専用メソッド）
        if (bffClient instanceof MockForecastBffClient) {
          setConfidenceLevels(bffClient.getConfidenceLevels())
          setWnbStartPeriodNo(bffClient.getWnbStartPeriodNo())
        }

        // Set initial defaults
        if (contextResponse.fiscalYears.length > 0) {
          setSelectedFiscalYear(contextResponse.fiscalYears[0].value)
        }
        if (contextResponse.departments.length > 0) {
          setSelectedDepartmentId(contextResponse.departments[0].id)
        }
        if (contextResponse.forecastEvents.length > 0) {
          setSelectedForecastEventId(contextResponse.forecastEvents[0].id)
        }
        if (contextResponse.forecastVersions.length > 0) {
          setSelectedForecastVersionId(contextResponse.forecastVersions[0].id)
        }
        // 予算対比用のデフォルト設定
        if (contextResponse.budgetVersions.length > 0) {
          setCompareBudgetVersionId(contextResponse.budgetVersions[0].id)
        }
        // 前回見込対比用のデフォルト設定（2番目のバージョン）
        if (contextResponse.forecastVersions.length > 1) {
          setComparePreviousVersionId(contextResponse.forecastVersions[1].id)
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
    if (
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedForecastEventId ||
      !selectedForecastVersionId
    ) {
      return
    }

    const loadGrid = async () => {
      try {
        setIsLoadingGrid(true)
        setError(null)

        const data = await bffClient.getGrid({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          forecastEventId: selectedForecastEventId,
          forecastVersionId: selectedForecastVersionId,
        })
        setGridData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの読み込みに失敗しました")
      } finally {
        setIsLoadingGrid(false)
      }
    }

    loadGrid()
  }, [
    bffClient,
    selectedFiscalYear,
    selectedDepartmentId,
    selectedForecastEventId,
    selectedForecastVersionId,
  ])

  // 予算対比データの読み込み
  React.useEffect(() => {
    if (
      compareMode !== "budget" ||
      !compareBudgetVersionId ||
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedForecastEventId ||
      !selectedForecastVersionId
    ) {
      setBudgetCompareData(null)
      return
    }

    const loadBudgetCompare = async () => {
      try {
        setIsLoadingBudgetCompare(true)
        const data = await bffClient.getBudgetCompare({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          forecastEventId: selectedForecastEventId,
          forecastVersionId: selectedForecastVersionId,
          budgetVersionId: compareBudgetVersionId,
        })
        setBudgetCompareData(data)
      } catch (err) {
        console.error("予算対比の読み込みに失敗しました", err)
      } finally {
        setIsLoadingBudgetCompare(false)
      }
    }

    loadBudgetCompare()
  }, [
    bffClient,
    compareMode,
    compareBudgetVersionId,
    selectedFiscalYear,
    selectedDepartmentId,
    selectedForecastEventId,
    selectedForecastVersionId,
  ])

  // 前回見込対比データの読み込み
  React.useEffect(() => {
    if (
      compareMode !== "previous" ||
      !comparePreviousVersionId ||
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedForecastEventId ||
      !selectedForecastVersionId ||
      comparePreviousVersionId === selectedForecastVersionId
    ) {
      setPreviousCompareData(null)
      return
    }

    const loadPreviousCompare = async () => {
      try {
        setIsLoadingPreviousCompare(true)
        const data = await bffClient.getPreviousCompare({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          forecastEventId: selectedForecastEventId,
          currentVersionId: selectedForecastVersionId,
          previousVersionId: comparePreviousVersionId,
        })
        setPreviousCompareData(data)
      } catch (err) {
        console.error("前回見込対比の読み込みに失敗しました", err)
      } finally {
        setIsLoadingPreviousCompare(false)
      }
    }

    loadPreviousCompare()
  }, [
    bffClient,
    compareMode,
    comparePreviousVersionId,
    selectedFiscalYear,
    selectedDepartmentId,
    selectedForecastEventId,
    selectedForecastVersionId,
  ])

  const handleCellChange = async (
    rowId: string,
    subjectId: string,
    periodId: string,
    dimensionValueId: string | null,
    value: string | null
  ): Promise<{ success: boolean; affectedRows?: BffAffectedRow[]; error?: string }> => {
    if (
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedForecastEventId ||
      !selectedForecastVersionId
    ) {
      return { success: false, error: "コンテキストが選択されていません" }
    }

    try {
      const result = await bffClient.updateCell(
        {
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          forecastEventId: selectedForecastEventId,
          forecastVersionId: selectedForecastVersionId,
        },
        {
          subjectId,
          periodId,
          dimensionValueId: dimensionValueId ?? undefined,
          value,
        }
      )

      // サマリーを更新
      if (result.updatedSummary && gridData) {
        setGridData({
          ...gridData,
          summary: result.updatedSummary,
        })
      }

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

  const handleToggleExpand = (rowId: string) => {
    if (bffClient instanceof MockForecastBffClient) {
      bffClient.toggleRowExpansion(rowId)
    }

    // Refresh grid to reflect expansion state
    if (gridData) {
      setGridData({
        ...gridData,
        rows: gridData.rows.map((r) =>
          r.rowId === rowId ? { ...r, isExpanded: !r.isExpanded } : r
        ),
      })
    }
  }

  // W/N/Bアイコンクリック時のハンドラ
  const handleWnbClick = (row: ForecastRowWithConfidence, periodId: string) => {
    // W/N/Bダイアログ用のモックデータを生成
    const periods = gridData?.periods.filter((p) => p.periodType === "MONTH").map((p) => {
      const monthNo = parseInt(p.periodLabel.replace("月", ""), 10)
      const isWnbEnabled = wnbStartPeriodNo ? monthNo >= wnbStartPeriodNo || monthNo <= 3 : false
      const cell = row.cells.find((c) => c.periodId === p.periodId)
      return {
        periodId: p.periodId,
        periodNo: monthNo,
        periodLabel: p.periodLabel,
        isWnbEnabled,
        isEditable: p.isEditable,
        worst: null,
        normal: cell?.value ?? "0",
        best: null,
        budget: String(Math.round((parseFloat(cell?.value ?? "0") || 0) * 1.05)),
      }
    }) ?? []

    setWnbDialogData({
      subjectId: row.subjectId,
      subjectCode: row.subjectCode,
      subjectName: row.subjectName,
      wnbStartPeriodNo: wnbStartPeriodNo ?? 10,
      periods,
      annualSummary: {
        worst: row.annualTotal,
        normal: row.annualTotal,
        best: row.annualTotal,
        budget: String(Math.round((parseFloat(row.annualTotal) || 0) * 1.05)),
      },
    })
    setWnbDialogOpen(true)
  }

  // W/N/B保存ハンドラ
  const handleWnbSave = async (values: BffWnbValue[]): Promise<{ success: boolean; error?: string }> => {
    // モック: 保存成功を返す
    console.log("W/N/B save:", values)
    return { success: true }
  }

  // 確度対応行データを取得
  const rowsWithConfidence = React.useMemo(() => {
    if (bffClient instanceof MockForecastBffClient && useConfidenceGrid) {
      return bffClient.getRowsWithConfidence()
    }
    return gridData?.rows ?? []
  }, [bffClient, useConfidenceGrid, gridData])

  // 科目フィルター適用済みの行
  const filteredGridRows = React.useMemo(() => {
    if (!gridData) return []
    const baseRows = useConfidenceGrid ? rowsWithConfidence : gridData.rows
    if (selectedSubjectIds.length === 0) return baseRows
    return baseRows.filter((row) => {
      if (selectedSubjectIds.includes(row.subjectId)) return true
      const parentRow = baseRows.find((r) => r.rowId === row.parentRowId)
      if (parentRow && selectedSubjectIds.includes(parentRow.subjectId)) return true
      return false
    })
  }, [gridData, selectedSubjectIds, useConfidenceGrid, rowsWithConfidence])

  // 前回見込バージョンの選択肢（現在選択中のバージョン以外）
  const previousVersionOptions = React.useMemo(() => {
    if (!contextData) return []
    return contextData.forecastVersions.filter(
      (v) => v.id !== selectedForecastVersionId
    )
  }, [contextData, selectedForecastVersionId])

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
            <Link href="/transactions/forecast-entry">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">見込入力</h1>
              <p className="text-sm text-muted-foreground mt-1">
                月次見込を入力・管理します
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gridData?.context && (
              <>
                <Badge
                  variant={
                    gridData.context.forecastVersionStatus === "FIXED"
                      ? "secondary"
                      : gridData.context.forecastVersionStatus === "APPROVED"
                      ? "default"
                      : "outline"
                  }
                >
                  {gridData.context.forecastVersionStatus === "DRAFT" && "下書き"}
                  {gridData.context.forecastVersionStatus === "SUBMITTED" && "提出済"}
                  {gridData.context.forecastVersionStatus === "APPROVED" && "承認済"}
                  {gridData.context.forecastVersionStatus === "FIXED" && "確定"}
                </Badge>
                {gridData.context.isEditable && (
                  <Badge variant="outline" className="text-success border-success">
                    <Save className="h-3 w-3 mr-1" />
                    編集可能
                  </Badge>
                )}
              </>
            )}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              新規見込作成
            </Button>
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

              {/* 見込イベント */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forecast-event" className="text-xs text-muted-foreground">
                  見込イベント
                </Label>
                <Select
                  value={selectedForecastEventId ?? ""}
                  onValueChange={setSelectedForecastEventId}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="forecast-event" className="w-[180px]">
                    <SelectValue placeholder="イベントを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contextData?.forecastEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* バージョン */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forecast-version" className="text-xs text-muted-foreground">
                  バージョン
                </Label>
                <Select
                  value={selectedForecastVersionId ?? ""}
                  onValueChange={setSelectedForecastVersionId}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="forecast-version" className="w-[160px]">
                    <SelectValue placeholder="バージョンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contextData?.forecastVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 比較モードセレクター */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-end gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    比較モード
                  </Label>
                  <Tabs
                    value={compareMode}
                    onValueChange={(value) => {
                      setCompareMode(value as CompareMode)
                      if (value !== "budget") {
                        setBudgetCompareData(null)
                      }
                      if (value !== "previous") {
                        setPreviousCompareData(null)
                      }
                    }}
                  >
                    <TabsList className="h-9">
                      <TabsTrigger value="none" className="text-xs">
                        比較しない
                      </TabsTrigger>
                      <TabsTrigger value="budget" className="text-xs">
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        予算対比
                      </TabsTrigger>
                      <TabsTrigger value="previous" className="text-xs">
                        <GitCompare className="h-3.5 w-3.5 mr-1" />
                        前回見込対比
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* 予算対比: 予算バージョン選択 */}
                {compareMode === "budget" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      比較対象予算
                    </Label>
                    <Select
                      value={compareBudgetVersionId ?? ""}
                      onValueChange={setCompareBudgetVersionId}
                      disabled={isLoadingGrid}
                    >
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="予算を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {contextData?.budgetVersions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 前回見込対比: 前回見込バージョン選択 */}
                {compareMode === "previous" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      比較対象バージョン
                    </Label>
                    <Select
                      value={comparePreviousVersionId ?? ""}
                      onValueChange={setComparePreviousVersionId}
                      disabled={isLoadingGrid}
                    >
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="バージョンを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {previousVersionOptions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* 科目フィルター */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <Label className="text-sm text-muted-foreground">
                  科目フィルター:
                </Label>
                <SubjectFilter
                  subjects={subjects}
                  selectedSubjectIds={selectedSubjectIds}
                  onSelectionChange={setSelectedSubjectIds}
                  disabled={isLoadingGrid}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Achievement Rate Panel */}
        {gridData?.summary && (
          <AchievementRatePanel
            summary={gridData.summary}
            showMonthlyDetails={showAchievementDetails}
            onToggleMonthlyDetails={() => setShowAchievementDetails(!showAchievementDetails)}
          />
        )}

        {/* Forecast Grid / Compare Grid */}
        {isLoadingGrid || isLoadingBudgetCompare || isLoadingPreviousCompare ? (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : compareMode === "budget" && compareBudgetVersionId && budgetCompareData ? (
          // 予算対比モード
          <BudgetCompareGrid data={budgetCompareData} loading={false} />
        ) : compareMode === "previous" && comparePreviousVersionId && previousCompareData ? (
          // 前回見込対比モード
          <PreviousForecastCompareGrid data={previousCompareData} loading={false} />
        ) : gridData ? (
          // 通常モード
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {gridData.context.forecastEventName} - {gridData.context.forecastVersionName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {gridData.context.departmentName} / {gridData.context.fiscalYear}年度
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-green-200/50">
                <CardHeader className="py-2 px-4 bg-green-50/30">
                  <CardTitle className="text-sm font-medium text-green-700">
                    見込 ({gridData.context.fiscalYear}年度) - {gridData.context.forecastVersionName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {useConfidenceGrid && confidenceLevels.length > 0 ? (
                    <ForecastGridWithConfidence
                      periods={gridData.periods}
                      rows={filteredGridRows as ForecastRowWithConfidence[]}
                      confidenceLevels={confidenceLevels}
                      wnbStartPeriodNo={wnbStartPeriodNo}
                      isEditable={gridData.context.isEditable}
                      onCellChange={handleCellChange}
                      onToggleExpand={handleToggleExpand}
                      onWnbClick={handleWnbClick}
                    />
                  ) : (
                    <ForecastGrid
                      periods={gridData.periods}
                      rows={filteredGridRows}
                      isEditable={gridData.context.isEditable}
                      onCellChange={handleCellChange}
                      onToggleExpand={handleToggleExpand}
                    />
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : null}

        {/* W/N/Bダイアログ */}
        {wnbDialogData && (
          <WnbInputDialog
            open={wnbDialogOpen}
            onOpenChange={setWnbDialogOpen}
            data={wnbDialogData}
            onSave={handleWnbSave}
          />
        )}
      </div>
    </div>
  )
}
