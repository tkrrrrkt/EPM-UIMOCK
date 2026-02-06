'use client';

/**
 * GlobalFilterBar Component
 *
 * Global filters for pivot analysis:
 * - Period range (From/To)
 * - Scenario type (Budget/Forecast/Actual)
 * - Display unit (Yen/Thousand/Million)
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.3)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@/shared/ui';
import { ScenarioType, UnitType, AnalysisMode } from '@epm/contracts/bff/multidim-analysis';
import { usePivotStore } from '../store/pivot-store';

const SCENARIO_OPTIONS = [
  { value: ScenarioType.BUDGET, label: '予算' },
  { value: ScenarioType.FORECAST, label: '見通し' },
  { value: ScenarioType.ACTUAL, label: '実績' },
];

const UNIT_OPTIONS = [
  { value: UnitType.YEN, label: '円' },
  { value: UnitType.THOUSAND, label: '千円' },
  { value: UnitType.MILLION, label: '百万円' },
];

const MODE_OPTIONS = [
  { value: AnalysisMode.STANDARD, label: '標準分析' },
  { value: AnalysisMode.PROJECT, label: 'プロジェクト分析' },
];

// Generate period options (last 24 months + current year)
function generatePeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  for (let year = currentYear - 1; year <= currentYear + 1; year++) {
    for (let month = 1; month <= 12; month++) {
      const value = `${year}/${String(month).padStart(2, '0')}`;
      options.push({ value, label: value });
    }
  }

  return options;
}

const PERIOD_OPTIONS = generatePeriodOptions();

export function GlobalFilterBar() {
  const { mode, globalFilters, setMode, setGlobalFilters } = usePivotStore();

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border">
      {/* Analysis Mode */}
      <div className="space-y-1.5">
        <Label className="text-xs">分析モード</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as AnalysisMode)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period From */}
      <div className="space-y-1.5">
        <Label className="text-xs">期間（開始）</Label>
        <Select
          value={globalFilters.periodFrom}
          onValueChange={(v) => setGlobalFilters({ periodFrom: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period To */}
      <div className="space-y-1.5">
        <Label className="text-xs">期間（終了）</Label>
        <Select
          value={globalFilters.periodTo}
          onValueChange={(v) => setGlobalFilters({ periodTo: v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scenario Type */}
      <div className="space-y-1.5">
        <Label className="text-xs">シナリオ</Label>
        <Select
          value={globalFilters.scenarioType}
          onValueChange={(v) => setGlobalFilters({ scenarioType: v as ScenarioType })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCENARIO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display Unit */}
      <div className="space-y-1.5">
        <Label className="text-xs">表示単位</Label>
        <Select
          value={globalFilters.unit}
          onValueChange={(v) => setGlobalFilters({ unit: v as UnitType })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
