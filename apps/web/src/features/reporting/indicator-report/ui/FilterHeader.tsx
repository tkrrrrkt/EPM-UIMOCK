"use client"

// ============================================================
// FilterHeader - Year, Primary/Compare, Event/Version selectors
// ============================================================

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  Badge,
  Skeleton,
  Switch,
  Separator,
} from "@/shared/ui"
import {
  ScenarioType,
  type BffPlanEventOption,
  type BffPlanVersionOption,
} from "@epm/contracts/bff/indicator-report"

interface FilterHeaderProps {
  // Year
  fiscalYears: number[]
  selectedYear: number | null
  onYearChange: (year: number) => void

  // Primary
  primaryScenarioType: ScenarioType | null
  onPrimaryScenarioChange: (scenario: ScenarioType) => void
  primaryEvents: BffPlanEventOption[]
  primaryEventId: string | null
  onPrimaryEventChange: (eventId: string) => void
  primaryVersions: BffPlanVersionOption[]
  primaryVersionId: string | null
  onPrimaryVersionChange: (versionId: string) => void

  // Compare
  compareEnabled: boolean
  onCompareEnabledChange: (enabled: boolean) => void
  compareScenarioType: ScenarioType | null
  onCompareScenarioChange: (scenario: ScenarioType) => void
  compareEvents: BffPlanEventOption[]
  compareEventId: string | null
  onCompareEventChange: (eventId: string) => void
  compareVersions: BffPlanVersionOption[]
  compareVersionId: string | null
  onCompareVersionChange: (versionId: string) => void

  // Loading state
  isLoading?: boolean
}

const scenarioLabels: Record<ScenarioType, string> = {
  BUDGET: "予算",
  FORECAST: "見込",
  ACTUAL: "実績",
}

export function FilterHeader({
  fiscalYears,
  selectedYear,
  onYearChange,
  primaryScenarioType,
  onPrimaryScenarioChange,
  primaryEvents,
  primaryEventId,
  onPrimaryEventChange,
  primaryVersions,
  primaryVersionId,
  onPrimaryVersionChange,
  compareEnabled,
  onCompareEnabledChange,
  compareScenarioType,
  onCompareScenarioChange,
  compareEvents,
  compareEventId,
  onCompareEventChange,
  compareVersions,
  compareVersionId,
  onCompareVersionChange,
  isLoading = false,
}: FilterHeaderProps) {
  // Check if events/versions should be shown based on scenario type
  const showPrimaryEvent =
    primaryScenarioType === ScenarioType.BUDGET ||
    primaryScenarioType === ScenarioType.FORECAST
  const showPrimaryVersion = primaryScenarioType === ScenarioType.BUDGET
  const showCompareEvent =
    compareScenarioType === ScenarioType.BUDGET ||
    compareScenarioType === ScenarioType.FORECAST
  const showCompareVersion = compareScenarioType === ScenarioType.BUDGET

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-muted/20 p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 bg-muted/20 p-4">
      <div className="space-y-4">
        {/* Primary Row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Fiscal Year */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">年度</Label>
            <Select
              value={selectedYear?.toString() || ""}
              onValueChange={(v) => onYearChange(Number(v))}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年度
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Scenario */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Primary
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                主軸
              </Badge>
            </Label>
            <Select
              value={primaryScenarioType || ""}
              onValueChange={(v) => onPrimaryScenarioChange(v as ScenarioType)}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(scenarioLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Event (BUDGET/FORECAST only) */}
          {showPrimaryEvent && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">イベント</Label>
              <Select
                value={primaryEventId || ""}
                onValueChange={onPrimaryEventChange}
                disabled={primaryEvents.length === 0}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {primaryEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Primary Version (BUDGET only) */}
          {showPrimaryVersion && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                バージョン
              </Label>
              <Select
                value={primaryVersionId || ""}
                onValueChange={onPrimaryVersionChange}
                disabled={primaryVersions.length === 0}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {primaryVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator className="bg-border/60" />

        {/* Compare Row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Compare Enable/Disable */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Compare
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                比較軸
              </Badge>
            </Label>
            <div className="flex items-center gap-2">
              <Switch checked={compareEnabled} onCheckedChange={onCompareEnabledChange} />
              <span className="text-xs text-muted-foreground">
                {compareEnabled ? "有効" : "無効"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">比較シナリオ</Label>
            <Select
              value={compareScenarioType || ""}
              onValueChange={(v) => onCompareScenarioChange(v as ScenarioType)}
              disabled={!compareEnabled}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(scenarioLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compare Event (BUDGET/FORECAST only) */}
          {compareEnabled && showCompareEvent && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">イベント</Label>
              <Select
                value={compareEventId || ""}
                onValueChange={onCompareEventChange}
                disabled={compareEvents.length === 0}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {compareEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compare Version (BUDGET only) */}
          {compareEnabled && showCompareVersion && (
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                バージョン
              </Label>
              <Select
                value={compareVersionId || ""}
                onValueChange={onCompareVersionChange}
                disabled={compareVersions.length === 0}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  {compareVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
