"use client"

// ============================================================
// IndicatorReportPage - Main container with state management
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "@/shared/ui"
import { FilterHeader } from "./FilterHeader"
import { PeriodGranularitySelector } from "./PeriodGranularitySelector"
import { DepartmentTreePanel } from "./DepartmentTreePanel"
import { ReportHeader } from "./ReportHeader"
import { ReportTable } from "./ReportTable"
import { ReportSummaryCards } from "./ReportSummaryCards"
import { LayoutNotConfiguredBlock } from "./LayoutNotConfiguredBlock"
import { RequiredFieldsBlock } from "./RequiredFieldsBlock"
import { createBffClient } from "../api"
import { getErrorMessage } from "../lib/error-messages"
import {
  ScenarioType,
  DisplayGranularity,
  type BffIndicatorReportLayoutResponse,
  type BffSelectorOptionsResponse,
  type BffIndicatorReportDataResponse,
  type BffPlanEventOption,
  type BffPlanVersionOption,
} from "@epm/contracts/bff/indicator-report"

// Initialize BFF client (mock for development)
const bffClient = createBffClient({ useMock: true })

interface FilterState {
  // Year
  fiscalYear: number | null

  // Primary
  primaryScenarioType: ScenarioType | null
  primaryEventId: string | null
  primaryVersionId: string | null

  // Compare
  compareEnabled: boolean
  compareScenarioType: ScenarioType | null
  compareEventId: string | null
  compareVersionId: string | null

  // Period
  startPeriod: string | null
  endPeriod: string | null
  granularity: DisplayGranularity | null

  // Department
  departmentId: string | null
  includeChildren: boolean
}

const initialFilterState: FilterState = {
  fiscalYear: null,
  primaryScenarioType: null,
  primaryEventId: null,
  primaryVersionId: null,
  compareEnabled: false,
  compareScenarioType: null,
  compareEventId: null,
  compareVersionId: null,
  startPeriod: null,
  endPeriod: null,
  granularity: null,
  departmentId: null,
  includeChildren: true,
}

const granularityLabels: Record<DisplayGranularity, string> = {
  MONTHLY: "月次",
  QUARTERLY: "四半期",
  HALF_YEARLY: "半期",
  YEARLY: "年度",
}

function formatPeriodCode(code: string): string {
  const match = code.match(/FY(\d{4})-P(\d{2})/)
  if (!match) return code
  return `${Number(match[2])}月`
}

export function IndicatorReportPage() {
  // Layout state
  const [layout, setLayout] = useState<BffIndicatorReportLayoutResponse | null>(
    null
  )
  const [layoutLoading, setLayoutLoading] = useState(true)
  const [layoutConfigured, setLayoutConfigured] = useState(true)

  // Selector options state
  const [selectorOptions, setSelectorOptions] =
    useState<BffSelectorOptionsResponse | null>(null)
  const [selectorLoading, setSelectorLoading] = useState(true)

  // Filter state
  const [filters, setFilters] = useState<FilterState>(initialFilterState)

  // Report data state
  const [reportData, setReportData] =
    useState<BffIndicatorReportDataResponse | null>(null)
  const [reportLoading, setReportLoading] = useState(false)

  // Filtered events/versions based on current selections
  const [primaryEvents, setPrimaryEvents] = useState<BffPlanEventOption[]>([])
  const [primaryVersions, setPrimaryVersions] = useState<
    BffPlanVersionOption[]
  >([])
  const [compareEvents, setCompareEvents] = useState<BffPlanEventOption[]>([])
  const [compareVersions, setCompareVersions] = useState<
    BffPlanVersionOption[]
  >([])

  // Check if required fields are filled
  const requiredFieldsFilled = useMemo(() => {
    const {
      fiscalYear,
      primaryScenarioType,
      startPeriod,
      endPeriod,
      granularity,
      departmentId,
    } = filters

    if (
      !fiscalYear ||
      !primaryScenarioType ||
      !startPeriod ||
      !endPeriod ||
      !granularity ||
      !departmentId
    ) {
      return false
    }

    // For BUDGET, need event and version
    if (primaryScenarioType === ScenarioType.BUDGET) {
      if (!filters.primaryEventId || !filters.primaryVersionId) return false
    }

    // For FORECAST, need event
    if (primaryScenarioType === ScenarioType.FORECAST) {
      if (!filters.primaryEventId) return false
    }

    return true
  }, [filters])

  // Load layout on mount
  useEffect(() => {
    async function loadLayout() {
      try {
        setLayoutLoading(true)
        const layoutData = await bffClient.getLayout()
        if (layoutData) {
          setLayout(layoutData)
          setLayoutConfigured(true)
        } else {
          setLayoutConfigured(false)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error"
        toast({
          title: "エラー",
          description: getErrorMessage(message),
          variant: "destructive",
        })
        setLayoutConfigured(false)
      } finally {
        setLayoutLoading(false)
      }
    }
    loadLayout()
  }, [])

  // Load initial selector options on mount
  useEffect(() => {
    async function loadSelectorOptions() {
      try {
        setSelectorLoading(true)
        const options = await bffClient.getSelectorOptions({})
        setSelectorOptions(options)

        // Set default fiscal year if available
        if (options.fiscalYears.length > 0) {
          setFilters((prev) => ({
            ...prev,
            fiscalYear: options.fiscalYears[0],
          }))
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error"
        toast({
          title: "エラー",
          description: getErrorMessage(message),
          variant: "destructive",
        })
      } finally {
        setSelectorLoading(false)
      }
    }
    loadSelectorOptions()
  }, [])

  // Update events/versions when year or scenario changes
  useEffect(() => {
    if (!selectorOptions || !filters.fiscalYear) return

    // Filter primary events
    if (filters.primaryScenarioType) {
      const filtered = selectorOptions.planEvents.filter(
        (e) =>
          e.fiscalYear === filters.fiscalYear &&
          e.scenarioType === filters.primaryScenarioType
      )
      setPrimaryEvents(filtered)

      // For FORECAST, filter to FIXED versions only
      if (filters.primaryScenarioType === ScenarioType.FORECAST) {
        setPrimaryVersions(
          selectorOptions.planVersions.filter((v) => v.status === "FIXED")
        )
      } else {
        setPrimaryVersions(selectorOptions.planVersions)
      }
    } else {
      setPrimaryEvents([])
      setPrimaryVersions([])
    }
  }, [selectorOptions, filters.fiscalYear, filters.primaryScenarioType])

  // Update compare events/versions
  useEffect(() => {
    if (!selectorOptions || !filters.fiscalYear || !filters.compareEnabled) {
      setCompareEvents([])
      setCompareVersions([])
      return
    }

    if (filters.compareScenarioType) {
      const filtered = selectorOptions.planEvents.filter(
        (e) =>
          e.fiscalYear === filters.fiscalYear &&
          e.scenarioType === filters.compareScenarioType
      )
      setCompareEvents(filtered)

      if (filters.compareScenarioType === ScenarioType.FORECAST) {
        setCompareVersions(
          selectorOptions.planVersions.filter((v) => v.status === "FIXED")
        )
      } else {
        setCompareVersions(selectorOptions.planVersions)
      }
    }
  }, [
    selectorOptions,
    filters.fiscalYear,
    filters.compareEnabled,
    filters.compareScenarioType,
  ])

  // Set default period when year changes
  useEffect(() => {
    if (filters.fiscalYear) {
      setFilters((prev) => ({
        ...prev,
        startPeriod: `FY${filters.fiscalYear}-P01`,
        endPeriod: `FY${filters.fiscalYear}-P12`,
      }))
    }
  }, [filters.fiscalYear])

  // Load report data when all required fields are filled
  const loadReportData = useCallback(async () => {
    if (!requiredFieldsFilled) return

    const {
      fiscalYear,
      primaryScenarioType,
      primaryEventId,
      primaryVersionId,
      compareEnabled,
      compareScenarioType,
      compareEventId,
      compareVersionId,
      startPeriod,
      endPeriod,
      granularity,
      departmentId,
      includeChildren,
    } = filters

    try {
      setReportLoading(true)
      const data = await bffClient.getReportData({
        fiscalYear: fiscalYear!,
        primaryScenarioType: primaryScenarioType!,
        primaryPlanEventId: primaryEventId || undefined,
        primaryPlanVersionId: primaryVersionId || undefined,
        compareScenarioType: compareEnabled
          ? compareScenarioType || undefined
          : undefined,
        comparePlanEventId: compareEnabled
          ? compareEventId || undefined
          : undefined,
        comparePlanVersionId: compareEnabled
          ? compareVersionId || undefined
          : undefined,
        startPeriodCode: startPeriod!,
        endPeriodCode: endPeriod!,
        displayGranularity: granularity!,
        departmentStableId: departmentId!,
        includeChildren,
      })
      setReportData(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "エラー",
        description: getErrorMessage(message),
        variant: "destructive",
      })
    } finally {
      setReportLoading(false)
    }
  }, [filters, requiredFieldsFilled])

  // Auto-load report data when required fields change
  useEffect(() => {
    if (requiredFieldsFilled) {
      loadReportData()
    }
  }, [requiredFieldsFilled, loadReportData])

  // Filter handlers
  const handleYearChange = (year: number) => {
    setFilters((prev) => ({
      ...prev,
      fiscalYear: year,
      primaryEventId: null,
      primaryVersionId: null,
      compareEventId: null,
      compareVersionId: null,
    }))
  }

  const handlePrimaryScenarioChange = (scenario: ScenarioType) => {
    setFilters((prev) => ({
      ...prev,
      primaryScenarioType: scenario,
      primaryEventId: null,
      primaryVersionId: null,
    }))
  }

  const handlePrimaryEventChange = (eventId: string) => {
    setFilters((prev) => ({ ...prev, primaryEventId: eventId }))
  }

  const handlePrimaryVersionChange = (versionId: string) => {
    setFilters((prev) => ({ ...prev, primaryVersionId: versionId }))
  }

  const handleCompareEnabledChange = (enabled: boolean) => {
    setFilters((prev) => ({
      ...prev,
      compareEnabled: enabled,
      compareScenarioType: enabled ? prev.compareScenarioType : null,
      compareEventId: null,
      compareVersionId: null,
    }))
  }

  const handleCompareScenarioChange = (scenario: ScenarioType) => {
    setFilters((prev) => ({
      ...prev,
      compareScenarioType: scenario,
      compareEventId: null,
      compareVersionId: null,
    }))
  }

  const handleCompareEventChange = (eventId: string) => {
    setFilters((prev) => ({ ...prev, compareEventId: eventId }))
  }

  const handleCompareVersionChange = (versionId: string) => {
    setFilters((prev) => ({ ...prev, compareVersionId: versionId }))
  }

  const handleStartPeriodChange = (period: string) => {
    setFilters((prev) => ({ ...prev, startPeriod: period }))
  }

  const handleEndPeriodChange = (period: string) => {
    setFilters((prev) => ({ ...prev, endPeriod: period }))
  }

  const handleGranularityChange = (granularity: DisplayGranularity) => {
    setFilters((prev) => ({ ...prev, granularity }))
  }

  const handleDepartmentSelect = (departmentId: string) => {
    setFilters((prev) => ({ ...prev, departmentId }))
  }

  const handleIncludeChildrenChange = (include: boolean) => {
    setFilters((prev) => ({ ...prev, includeChildren: include }))
  }

  // Generate labels for table headers
  const primaryLabel = useMemo(() => {
    if (!filters.primaryScenarioType) return "Primary"
    const scenarioLabel =
      filters.primaryScenarioType === ScenarioType.BUDGET
        ? "予算"
        : filters.primaryScenarioType === ScenarioType.FORECAST
          ? "見込"
          : "実績"
    const event = primaryEvents.find((e) => e.id === filters.primaryEventId)
    return event ? event.eventName : scenarioLabel
  }, [filters.primaryScenarioType, filters.primaryEventId, primaryEvents])

  const compareLabel = useMemo(() => {
    if (!filters.compareEnabled || !filters.compareScenarioType) return "Compare"
    const scenarioLabel =
      filters.compareScenarioType === ScenarioType.BUDGET
        ? "予算"
        : filters.compareScenarioType === ScenarioType.FORECAST
          ? "見込"
          : "実績"
    const event = compareEvents.find((e) => e.id === filters.compareEventId)
    return event ? event.eventName : scenarioLabel
  }, [
    filters.compareEnabled,
    filters.compareScenarioType,
    filters.compareEventId,
    compareEvents,
  ])

  const periodLabel = useMemo(() => {
    if (!reportData?.periodRange) return null
    const start = formatPeriodCode(reportData.periodRange.start)
    const end = formatPeriodCode(reportData.periodRange.end)
    return `${start}〜${end}`
  }, [reportData])

  const granularityLabel = useMemo(() => {
    if (!reportData?.periodRange?.granularity) return null
    return granularityLabels[reportData.periodRange.granularity]
  }, [reportData])

  // Loading state
  if (layoutLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  // Layout not configured
  if (!layoutConfigured) {
    return <LayoutNotConfiguredBlock />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Filter Area */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <FilterHeader
          fiscalYears={selectorOptions?.fiscalYears || []}
          selectedYear={filters.fiscalYear}
          onYearChange={handleYearChange}
          primaryScenarioType={filters.primaryScenarioType}
          onPrimaryScenarioChange={handlePrimaryScenarioChange}
          primaryEvents={primaryEvents}
          primaryEventId={filters.primaryEventId}
          onPrimaryEventChange={handlePrimaryEventChange}
          primaryVersions={primaryVersions}
          primaryVersionId={filters.primaryVersionId}
          onPrimaryVersionChange={handlePrimaryVersionChange}
          compareEnabled={filters.compareEnabled}
          onCompareEnabledChange={handleCompareEnabledChange}
          compareScenarioType={filters.compareScenarioType}
          onCompareScenarioChange={handleCompareScenarioChange}
          compareEvents={compareEvents}
          compareEventId={filters.compareEventId}
          onCompareEventChange={handleCompareEventChange}
          compareVersions={compareVersions}
          compareVersionId={filters.compareVersionId}
          onCompareVersionChange={handleCompareVersionChange}
          isLoading={selectorLoading}
        />

        <PeriodGranularitySelector
          fiscalYear={filters.fiscalYear}
          startPeriod={filters.startPeriod}
          endPeriod={filters.endPeriod}
          onStartPeriodChange={handleStartPeriodChange}
          onEndPeriodChange={handleEndPeriodChange}
          granularity={filters.granularity}
          onGranularityChange={handleGranularityChange}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Department Tree */}
        <div className="lg:h-[calc(100vh-340px)]">
          <DepartmentTreePanel
            departments={selectorOptions?.departments || []}
            selectedDepartmentId={filters.departmentId}
            onDepartmentSelect={handleDepartmentSelect}
            includeChildren={filters.includeChildren}
            onIncludeChildrenChange={handleIncludeChildrenChange}
            isLoading={selectorLoading}
          />
        </div>

        {/* Report Area */}
        <div className="flex flex-col gap-4">
          {requiredFieldsFilled ? (
            <>
              {layout && (
                <ReportHeader
                  layoutName={layout.layoutName}
                  headerText={layout.headerText}
                  fiscalYear={reportData?.fiscalYear ?? filters.fiscalYear}
                  periodLabel={periodLabel}
                  granularityLabel={granularityLabel}
                  departmentName={reportData?.departmentName ?? null}
                  includeChildren={filters.includeChildren}
                  primaryLabel={primaryLabel}
                  compareEnabled={filters.compareEnabled}
                  compareLabel={compareLabel}
                />
              )}
              <ReportSummaryCards
                rows={reportData?.rows || []}
                showCompare={filters.compareEnabled}
                primaryLabel={primaryLabel}
                compareLabel={compareLabel}
              />
              <ReportTable
                rows={reportData?.rows || []}
                showCompare={filters.compareEnabled}
                primaryLabel={primaryLabel}
                compareLabel={compareLabel}
                isLoading={reportLoading}
              />
            </>
          ) : (
            <RequiredFieldsBlock />
          )}
        </div>
      </div>
    </div>
  )
}
