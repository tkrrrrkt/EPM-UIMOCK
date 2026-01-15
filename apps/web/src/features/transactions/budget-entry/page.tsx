"use client"

import * as React from "react"
import { ArrowLeft, Loader2, Save, History, GitCompare } from "lucide-react"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui"
import { BudgetGrid } from "./ui/BudgetGrid"
import { HistoricalActualsPanel } from "./ui/HistoricalActualsPanel"
import { HistoricalCompareGrid } from "./ui/HistoricalCompareGrid"
import { VersionCompareGrid } from "./ui/VersionCompareGrid"
import { SubjectFilter } from "./ui/SubjectFilter"
import type { BffClient } from "./api/BffClient"
import { MockBffClient } from "./api/MockBffClient"
import type {
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffBudgetCompareResponse,
  BffAffectedRow,
  BffHistoricalActualResponse,
  BffHistoricalCompareResponse,
  BffSubjectSummary,
} from "@epm/contracts/bff/budget-entry"

// ============================================
// Types
// ============================================

type CompareMode = "none" | "historical" | "version"

interface BudgetEntryPageProps {
  client?: BffClient
}

// ============================================
// Component
// ============================================

export function BudgetEntryPage({ client }: BudgetEntryPageProps) {
  const bffClient = React.useMemo(() => client ?? new MockBffClient(), [client])

  // State
  const [contextData, setContextData] = React.useState<BffBudgetContextResponse | null>(null)
  const [gridData, setGridData] = React.useState<BffBudgetGridResponse | null>(null)
  const [historicalData, setHistoricalData] = React.useState<BffHistoricalActualResponse | null>(null)
  const [subjects, setSubjects] = React.useState<BffSubjectSummary[]>([])

  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState<number | null>(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | null>(null)
  const [selectedPlanEventId, setSelectedPlanEventId] = React.useState<string | null>(null)
  const [selectedPlanVersionId, setSelectedPlanVersionId] = React.useState<string | null>(null)

  const [showHistorical, setShowHistorical] = React.useState(false)
  const [selectedSubjectIds, setSelectedSubjectIds] = React.useState<string[]>([])

  // 比較モード（タブ切り替え）
  const [compareMode, setCompareMode] = React.useState<CompareMode>("none")

  // 過去実績比較用
  const [compareYear, setCompareYear] = React.useState<number | null>(null)
  const [historicalCompareData, setHistoricalCompareData] = React.useState<BffHistoricalCompareResponse | null>(null)
  const [isLoadingHistoricalCompare, setIsLoadingHistoricalCompare] = React.useState(false)

  // バージョン比較用
  const [compareVersionId, setCompareVersionId] = React.useState<string | null>(null)
  const [versionCompareData, setVersionCompareData] = React.useState<BffBudgetCompareResponse | null>(null)
  const [isLoadingVersionCompare, setIsLoadingVersionCompare] = React.useState(false)

  const [isLoadingContext, setIsLoadingContext] = React.useState(true)
  const [isLoadingGrid, setIsLoadingGrid] = React.useState(false)
  const [isLoadingHistorical, setIsLoadingHistorical] = React.useState(false)
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

        // Set initial defaults
        if (contextResponse.fiscalYears.length > 0) {
          setSelectedFiscalYear(contextResponse.fiscalYears[0].value)
        }
        if (contextResponse.departments.length > 0) {
          setSelectedDepartmentId(contextResponse.departments[0].id)
        }
        // 予算イベントのみを対象（BUDGET scenarioType）
        const budgetEvents = contextResponse.planEvents.filter(e => e.scenarioType === "BUDGET")
        if (budgetEvents.length > 0) {
          setSelectedPlanEventId(budgetEvents[0].id)
        }
        if (contextResponse.planVersions.length > 0) {
          setSelectedPlanVersionId(contextResponse.planVersions[0].id)
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
      !selectedPlanEventId ||
      !selectedPlanVersionId
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
          planEventId: selectedPlanEventId,
          planVersionId: selectedPlanVersionId,
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
    selectedPlanEventId,
    selectedPlanVersionId,
  ])

  // Load historical data when toggle is on
  React.useEffect(() => {
    if (!showHistorical || !selectedDepartmentId || !selectedFiscalYear) {
      setHistoricalData(null)
      return
    }

    const loadHistorical = async () => {
      try {
        setIsLoadingHistorical(true)
        // 過去3年度の実績を取得
        const pastYears = [
          selectedFiscalYear - 1,
          selectedFiscalYear - 2,
          selectedFiscalYear - 3,
        ]
        const data = await bffClient.getHistoricalActuals({
          departmentId: selectedDepartmentId,
          fiscalYears: pastYears,
          subjectIds: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
        })
        setHistoricalData(data)
      } catch (err) {
        console.error("過去実績の読み込みに失敗しました", err)
      } finally {
        setIsLoadingHistorical(false)
      }
    }

    loadHistorical()
  }, [bffClient, showHistorical, selectedDepartmentId, selectedFiscalYear, selectedSubjectIds])

  // 過去実績比較データの読み込み（年度が選択されたら比較モード）
  React.useEffect(() => {
    if (
      !compareYear ||
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedPlanEventId ||
      !selectedPlanVersionId
    ) {
      setHistoricalCompareData(null)
      return
    }

    const loadHistoricalCompare = async () => {
      try {
        setIsLoadingHistoricalCompare(true)
        const data = await bffClient.getHistoricalCompare({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          planEventId: selectedPlanEventId,
          planVersionId: selectedPlanVersionId,
          compareFiscalYear: compareYear,
        })
        setHistoricalCompareData(data)
      } catch (err) {
        console.error("過去実績比較の読み込みに失敗しました", err)
      } finally {
        setIsLoadingHistoricalCompare(false)
      }
    }

    loadHistoricalCompare()
  }, [
    bffClient,
    compareYear,
    selectedFiscalYear,
    selectedDepartmentId,
    selectedPlanEventId,
    selectedPlanVersionId,
  ])

  // バージョン比較データの読み込み
  React.useEffect(() => {
    if (
      !compareVersionId ||
      !selectedFiscalYear ||
      !selectedDepartmentId ||
      !selectedPlanEventId ||
      !selectedPlanVersionId ||
      compareVersionId === selectedPlanVersionId
    ) {
      setVersionCompareData(null)
      return
    }

    const loadVersionCompare = async () => {
      try {
        setIsLoadingVersionCompare(true)
        const data = await bffClient.getCompare({
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          planEventId: selectedPlanEventId,
          baseVersionId: compareVersionId,
          currentVersionId: selectedPlanVersionId,
        })
        setVersionCompareData(data)
      } catch (err) {
        console.error("バージョン比較の読み込みに失敗しました", err)
      } finally {
        setIsLoadingVersionCompare(false)
      }
    }

    loadVersionCompare()
  }, [
    bffClient,
    compareVersionId,
    selectedFiscalYear,
    selectedDepartmentId,
    selectedPlanEventId,
    selectedPlanVersionId,
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
      !selectedPlanEventId ||
      !selectedPlanVersionId
    ) {
      return { success: false, error: "コンテキストが選択されていません" }
    }

    try {
      const result = await bffClient.updateCell(
        {
          fiscalYear: selectedFiscalYear,
          departmentId: selectedDepartmentId,
          planEventId: selectedPlanEventId,
          planVersionId: selectedPlanVersionId,
        },
        {
          subjectId,
          periodId,
          dimensionValueId: dimensionValueId ?? undefined,
          value,
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

  const handleToggleExpand = (rowId: string) => {
    if (bffClient instanceof MockBffClient) {
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

  // 予算イベントのみフィルター
  const budgetEvents = contextData?.planEvents.filter(e => e.scenarioType === "BUDGET") ?? []

  // 科目フィルター適用済みの予算グリッド行
  const filteredGridRows = React.useMemo(() => {
    if (!gridData) return []
    if (selectedSubjectIds.length === 0) return gridData.rows
    // 選択された科目とその子行（ディメンション展開行）を表示
    return gridData.rows.filter(row => {
      // 親行が選択されているか
      if (selectedSubjectIds.includes(row.subjectId)) return true
      // 親行のsubjectIdが選択されている場合、子行も表示
      const parentRow = gridData.rows.find(r => r.rowId === row.parentRowId)
      if (parentRow && selectedSubjectIds.includes(parentRow.subjectId)) return true
      return false
    })
  }, [gridData, selectedSubjectIds])

  // 過去実績比較用の年度リスト（選択年度の-1〜-3年）
  const compareYearOptions = React.useMemo(() => {
    if (!selectedFiscalYear) return []
    return [
      { value: selectedFiscalYear - 1, label: `${selectedFiscalYear - 1}年度実績` },
      { value: selectedFiscalYear - 2, label: `${selectedFiscalYear - 2}年度実績` },
      { value: selectedFiscalYear - 3, label: `${selectedFiscalYear - 3}年度実績` },
    ]
  }, [selectedFiscalYear])

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
            <Link href="/transactions/budget-entry">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">予算入力</h1>
              <p className="text-sm text-muted-foreground mt-1">
                科目×月の予算データを入力します
              </p>
            </div>
          </div>
          {gridData?.context && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  gridData.context.planVersionStatus === "FIXED"
                    ? "secondary"
                    : gridData.context.planVersionStatus === "APPROVED"
                    ? "default"
                    : "outline"
                }
              >
                {gridData.context.planVersionStatus === "DRAFT" && "下書き"}
                {gridData.context.planVersionStatus === "SUBMITTED" && "提出済"}
                {gridData.context.planVersionStatus === "APPROVED" && "承認済"}
                {gridData.context.planVersionStatus === "FIXED" && "確定"}
              </Badge>
              {gridData.context.isEditable && (
                <Badge variant="outline" className="text-success border-success">
                  <Save className="h-3 w-3 mr-1" />
                  編集可能
                </Badge>
              )}
            </div>
          )}
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

              {/* 予算イベント */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-event" className="text-xs text-muted-foreground">
                  予算イベント
                </Label>
                <Select
                  value={selectedPlanEventId ?? ""}
                  onValueChange={setSelectedPlanEventId}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="plan-event" className="w-[180px]">
                    <SelectValue placeholder="イベントを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* バージョン */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan-version" className="text-xs text-muted-foreground">
                  バージョン
                </Label>
                <Select
                  value={selectedPlanVersionId ?? ""}
                  onValueChange={setSelectedPlanVersionId}
                  disabled={isLoadingGrid || !contextData}
                >
                  <SelectTrigger id="plan-version" className="w-[140px]">
                    <SelectValue placeholder="バージョンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contextData?.planVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 過去実績表示トグル */}
              <div className="flex flex-col gap-1.5 ml-auto">
                <Label className="text-xs text-muted-foreground invisible">過去実績</Label>
                <div className="flex items-center gap-2 h-9">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-historical" className="text-sm">
                    過去実績を表示
                  </Label>
                  <Switch
                    id="show-historical"
                    checked={showHistorical}
                    onCheckedChange={setShowHistorical}
                  />
                </div>
              </div>
            </div>

            {/* 比較モードセレクター（タブ切り替え） */}
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
                      // モード切り替え時に状態をリセット
                      if (value !== "historical") {
                        setCompareYear(null)
                        setHistoricalCompareData(null)
                      }
                      if (value !== "version") {
                        setCompareVersionId(null)
                        setVersionCompareData(null)
                      }
                    }}
                  >
                    <TabsList className="h-9">
                      <TabsTrigger value="none" className="text-xs">
                        比較しない
                      </TabsTrigger>
                      <TabsTrigger value="historical" className="text-xs">
                        <History className="h-3.5 w-3.5 mr-1" />
                        過去実績比較
                      </TabsTrigger>
                      <TabsTrigger value="version" className="text-xs">
                        <GitCompare className="h-3.5 w-3.5 mr-1" />
                        Ver比較
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* 過去実績比較: 年度選択 */}
                {compareMode === "historical" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      比較対象年度
                    </Label>
                    <Select
                      value={compareYear?.toString() ?? ""}
                      onValueChange={(value) => setCompareYear(value ? parseInt(value, 10) : null)}
                      disabled={isLoadingGrid}
                    >
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="年度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {compareYearOptions.map((year) => (
                          <SelectItem key={year.value} value={year.value.toString()}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* バージョン比較: バージョン選択 */}
                {compareMode === "version" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      比較対象バージョン
                    </Label>
                    <Select
                      value={compareVersionId ?? ""}
                      onValueChange={setCompareVersionId}
                      disabled={isLoadingGrid}
                    >
                      <SelectTrigger className="w-[160px] h-9">
                        <SelectValue placeholder="バージョンを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {contextData?.planVersions
                          .filter((v) => v.id !== selectedPlanVersionId)
                          .map((version) => (
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

            {/* 科目フィルター（常に表示 - 予算グリッドと過去実績の両方に適用） */}
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

        {/* Budget Grid / Compare Grid */}
        {isLoadingGrid || isLoadingHistoricalCompare || isLoadingVersionCompare ? (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : compareMode === "historical" && compareYear && historicalCompareData ? (
          // 過去実績比較モード
          <>
            <HistoricalCompareGrid
              data={historicalCompareData}
              loading={false}
            />
            {/* 過去実績パネル（トグルON時） */}
            {showHistorical && gridData && (
              <HistoricalActualsPanel
                data={historicalData}
                loading={isLoadingHistorical}
                selectedSubjectIds={selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined}
                periods={gridData.periods}
              />
            )}
          </>
        ) : compareMode === "version" && compareVersionId && versionCompareData ? (
          // バージョン比較モード
          <>
            <VersionCompareGrid
              data={versionCompareData}
              loading={false}
            />
            {/* 過去実績パネル（トグルON時） */}
            {showHistorical && gridData && (
              <HistoricalActualsPanel
                data={historicalData}
                loading={isLoadingHistorical}
                selectedSubjectIds={selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined}
                periods={gridData.periods}
              />
            )}
          </>
        ) : gridData ? (
          // 通常モード: 外側カード（予算+過去実績）で列位置を揃える
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {gridData.context.planEventName} - {gridData.context.planVersionName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {gridData.context.departmentName} / {gridData.context.fiscalYear}年度
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 内側カード: 予算入力グリッド */}
              <Card className="border-blue-200/50">
                <CardHeader className="py-2 px-4 bg-blue-50/30">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    予算 ({gridData.context.fiscalYear}年度)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <BudgetGrid
                    periods={gridData.periods}
                    rows={filteredGridRows}
                    isEditable={gridData.context.isEditable}
                    onCellChange={handleCellChange}
                    onToggleExpand={handleToggleExpand}
                  />
                </CardContent>
              </Card>

              {/* 内側カード: 過去実績パネル（表示時のみ） */}
              {showHistorical && (
                <HistoricalActualsPanel
                  data={historicalData}
                  loading={isLoadingHistorical}
                  selectedSubjectIds={selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined}
                  periods={gridData.periods}
                />
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
