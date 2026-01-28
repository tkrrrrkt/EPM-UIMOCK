'use client';

import { useMemo } from 'react';
import { Label, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui';
import type {
  BffCvpOptionsResponse,
  CvpFilterState,
  CvpPrimaryType,
  CvpGranularity,
} from '../types';

interface CvpFiltersProps {
  options: BffCvpOptionsResponse;
  filters: CvpFilterState;
  onFilterChange: (filters: Partial<CvpFilterState>) => void;
}

const PRIMARY_TYPE_LABELS: Record<CvpPrimaryType, string> = {
  BUDGET: '予算',
  FORECAST: '見込',
  ACTUAL: '実績',
};

const GRANULARITY_LABELS: Record<CvpGranularity, string> = {
  MONTHLY: '月次',
  QUARTERLY: '四半期',
  SEMI_ANNUAL: '半期',
  ANNUAL: '年度',
};

const PERIOD_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}月`,
}));

export function CvpFilters({ options, filters, onFilterChange }: CvpFiltersProps) {
  // Filter events based on selected fiscal year and primary type
  const availableEvents = useMemo(() => {
    if (!filters.fiscalYear || !filters.primaryType) return [];

    if (filters.primaryType === 'BUDGET') {
      return options.budgetEvents.filter((e) => e.fiscalYear === filters.fiscalYear);
    }
    if (filters.primaryType === 'FORECAST') {
      return options.forecastEvents.filter(
        (e) => e.fiscalYear === filters.fiscalYear && e.hasFixedVersion
      );
    }
    return [];
  }, [options, filters.fiscalYear, filters.primaryType]);

  // Filter versions based on selected event
  const availableVersions = useMemo(() => {
    if (!filters.primaryEventId) return [];
    return options.versions[filters.primaryEventId] || [];
  }, [options, filters.primaryEventId]);

  // Compare events
  const compareEvents = useMemo(() => {
    if (!filters.compareFiscalYear || !filters.compareType) return [];

    if (filters.compareType === 'BUDGET') {
      return options.budgetEvents.filter((e) => e.fiscalYear === filters.compareFiscalYear);
    }
    if (filters.compareType === 'FORECAST') {
      return options.forecastEvents.filter(
        (e) => e.fiscalYear === filters.compareFiscalYear && e.hasFixedVersion
      );
    }
    return [];
  }, [options, filters.compareFiscalYear, filters.compareType]);

  const compareVersions = useMemo(() => {
    if (!filters.compareEventId) return [];
    return options.versions[filters.compareEventId] || [];
  }, [options, filters.compareEventId]);

  const showEventSelector = filters.primaryType === 'BUDGET' || filters.primaryType === 'FORECAST';
  const showVersionSelector = filters.primaryType === 'BUDGET';

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      {/* Row 1: Primary selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">年度</Label>
          <Select
            value={filters.fiscalYear?.toString() || ''}
            onValueChange={(value) => {
              onFilterChange({
                fiscalYear: parseInt(value),
                primaryEventId: null,
                primaryVersionId: null,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選択..." />
            </SelectTrigger>
            <SelectContent>
              {options.fiscalYears.map((fy) => (
                <SelectItem key={fy.fiscalYear} value={fy.fiscalYear.toString()}>
                  {fy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">データソース</Label>
          <Select
            value={filters.primaryType || ''}
            onValueChange={(value) => {
              onFilterChange({
                primaryType: value as CvpPrimaryType,
                primaryEventId: null,
                primaryVersionId: null,
              });
            }}
            disabled={!filters.fiscalYear}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選択..." />
            </SelectTrigger>
            <SelectContent>
              {(['BUDGET', 'FORECAST', 'ACTUAL'] as CvpPrimaryType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {PRIMARY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showEventSelector && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">イベント</Label>
            <Select
              value={filters.primaryEventId || ''}
              onValueChange={(value) => {
                onFilterChange({
                  primaryEventId: value,
                  primaryVersionId: null,
                });
              }}
              disabled={!filters.primaryType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id}>
                    {evt.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showVersionSelector && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">バージョン</Label>
            <Select
              value={filters.primaryVersionId || ''}
              onValueChange={(value) => {
                onFilterChange({ primaryVersionId: value });
              }}
              disabled={!filters.primaryEventId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {availableVersions.map((ver) => (
                  <SelectItem key={ver.id} value={ver.id}>
                    {ver.versionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5 flex items-end">
          <div className="flex items-center gap-2 pb-2">
            <Switch
              id="compare-toggle"
              checked={filters.compareEnabled}
              onCheckedChange={(checked) => {
                onFilterChange({
                  compareEnabled: checked,
                  compareFiscalYear: checked ? filters.fiscalYear : null,
                  compareType: null,
                  compareEventId: null,
                  compareVersionId: null,
                });
              }}
            />
            <Label htmlFor="compare-toggle" className="text-sm">
              比較表示
            </Label>
          </div>
        </div>
      </div>

      {/* Row 2: Compare selection (if enabled) */}
      {filters.compareEnabled && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">比較年度</Label>
            <Select
              value={filters.compareFiscalYear?.toString() || ''}
              onValueChange={(value) => {
                onFilterChange({
                  compareFiscalYear: parseInt(value),
                  compareEventId: null,
                  compareVersionId: null,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {options.fiscalYears.map((fy) => (
                  <SelectItem key={fy.fiscalYear} value={fy.fiscalYear.toString()}>
                    {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">比較データソース</Label>
            <Select
              value={filters.compareType || ''}
              onValueChange={(value) => {
                onFilterChange({
                  compareType: value as CvpPrimaryType,
                  compareEventId: null,
                  compareVersionId: null,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {(['BUDGET', 'FORECAST', 'ACTUAL'] as CvpPrimaryType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {PRIMARY_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filters.compareType && filters.compareType !== 'ACTUAL' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">比較イベント</Label>
              <Select
                value={filters.compareEventId || ''}
                onValueChange={(value) => {
                  onFilterChange({
                    compareEventId: value,
                    compareVersionId: null,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  {compareEvents.map((evt) => (
                    <SelectItem key={evt.id} value={evt.id}>
                      {evt.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filters.compareType === 'BUDGET' && filters.compareEventId && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">比較バージョン</Label>
              <Select
                value={filters.compareVersionId || ''}
                onValueChange={(value) => {
                  onFilterChange({ compareVersionId: value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  {compareVersions.map((ver) => (
                    <SelectItem key={ver.id} value={ver.id}>
                      {ver.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Period and Granularity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">開始期間</Label>
          <Select
            value={filters.periodFrom.toString()}
            onValueChange={(value) => {
              const from = parseInt(value);
              onFilterChange({
                periodFrom: from,
                periodTo: Math.max(from, filters.periodTo),
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value.toString()}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">終了期間</Label>
          <Select
            value={filters.periodTo.toString()}
            onValueChange={(value) => {
              onFilterChange({ periodTo: parseInt(value) });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.filter((p) => p.value >= filters.periodFrom).map((p) => (
                <SelectItem key={p.value} value={p.value.toString()}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">表示粒度</Label>
          <Select
            value={filters.granularity}
            onValueChange={(value) => {
              onFilterChange({ granularity: value as CvpGranularity });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(GRANULARITY_LABELS) as CvpGranularity[]).map((g) => (
                <SelectItem key={g} value={g}>
                  {GRANULARITY_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
