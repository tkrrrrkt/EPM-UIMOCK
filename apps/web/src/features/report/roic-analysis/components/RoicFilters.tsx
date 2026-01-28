'use client';

import {
  Badge,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import type {
  RoicMode,
  RoicPrimaryType,
  RoicGranularity,
  BffRoicOptionsResponse,
  RoicFilterState,
} from '../types';

interface RoicFiltersProps {
  options: BffRoicOptionsResponse;
  filterState: RoicFilterState;
  onFilterChange: (partial: Partial<RoicFilterState>) => void;
}

const PRIMARY_TYPE_LABELS: Record<RoicPrimaryType, string> = {
  BUDGET: '予算',
  FORECAST: '見込',
  ACTUAL: '実績',
};

const GRANULARITY_LABELS: Record<RoicGranularity, string> = {
  MONTHLY: '月次',
  QUARTERLY: '四半期',
  SEMI_ANNUAL: '半期',
  ANNUAL: '年度',
};

const MODE_LABELS: Record<RoicMode, string> = {
  STANDARD: '標準モード',
  SIMPLIFIED: '簡易モード',
};

export function RoicFilters({
  options,
  filterState,
  onFilterChange,
}: RoicFiltersProps) {
  const isSimplified = options.mode === 'SIMPLIFIED';

  // 簡易モードでは粒度制限あり
  const availableGranularities: RoicGranularity[] = isSimplified
    ? ['SEMI_ANNUAL', 'ANNUAL']
    : ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];

  // 簡易モードではPrimary制限あり
  const availablePrimaryTypes: RoicPrimaryType[] = isSimplified
    ? ['ACTUAL']
    : ['BUDGET', 'FORECAST', 'ACTUAL'];

  // イベント選択肢
  const events =
    filterState.primaryType === 'BUDGET'
      ? options.budgetEvents.filter(
          (e) => e.fiscalYear === filterState.fiscalYear
        )
      : filterState.primaryType === 'FORECAST'
        ? options.forecastEvents.filter(
            (e) => e.fiscalYear === filterState.fiscalYear
          )
        : [];

  // バージョン選択肢
  const versions = filterState.primaryEventId
    ? options.versions[filterState.primaryEventId] || []
    : [];

  // Compare用イベント
  const compareEvents =
    filterState.compareType === 'BUDGET'
      ? options.budgetEvents.filter(
          (e) => e.fiscalYear === filterState.compareFiscalYear
        )
      : filterState.compareType === 'FORECAST'
        ? options.forecastEvents.filter(
            (e) => e.fiscalYear === filterState.compareFiscalYear
          )
        : [];

  // Compare用バージョン
  const compareVersions = filterState.compareEventId
    ? options.versions[filterState.compareEventId] || []
    : [];

  // 期間選択肢（粒度に応じて変化）
  const getPeriodOptions = () => {
    switch (filterState.granularity) {
      case 'MONTHLY':
        return Array.from({ length: 12 }, (_, i) => ({
          value: i + 1,
          label: `${i + 1}月`,
        }));
      case 'QUARTERLY':
        return [
          { value: 1, label: 'Q1' },
          { value: 2, label: 'Q2' },
          { value: 3, label: 'Q3' },
          { value: 4, label: 'Q4' },
        ];
      case 'SEMI_ANNUAL':
        return [
          { value: 1, label: '上期' },
          { value: 2, label: '下期' },
        ];
      case 'ANNUAL':
        return [{ value: 1, label: '通期' }];
      default:
        return [];
    }
  };

  const periodOptions = getPeriodOptions();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* モードバッジ */}
        <Badge
          variant={isSimplified ? 'secondary' : 'default'}
          className="h-6"
        >
          {MODE_LABELS[options.mode]}
        </Badge>

        {/* 年度 */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">年度</Label>
          <Select
            value={String(filterState.fiscalYear)}
            onValueChange={(v) =>
              onFilterChange({ fiscalYear: Number(v) })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.fiscalYears.map((fy) => (
                <SelectItem key={fy.fiscalYear} value={String(fy.fiscalYear)}>
                  {fy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Type */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Primary</Label>
          <Select
            value={filterState.primaryType}
            onValueChange={(v) =>
              onFilterChange({
                primaryType: v as RoicPrimaryType,
                primaryEventId: undefined,
                primaryVersionId: undefined,
              })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePrimaryTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {PRIMARY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* イベント（予算/見込の場合のみ） */}
        {filterState.primaryType !== 'ACTUAL' && events.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">イベント</Label>
            <Select
              value={filterState.primaryEventId || ''}
              onValueChange={(v) =>
                onFilterChange({
                  primaryEventId: v,
                  primaryVersionId: undefined,
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {events.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id}>
                    {evt.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* バージョン */}
        {versions.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">バージョン</Label>
            <Select
              value={filterState.primaryVersionId || ''}
              onValueChange={(v) => onFilterChange({ primaryVersionId: v })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                {versions.map((ver) => (
                  <SelectItem key={ver.id} value={ver.id}>
                    {ver.versionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 粒度 */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">粒度</Label>
          <Select
            value={filterState.granularity}
            onValueChange={(v) =>
              onFilterChange({
                granularity: v as RoicGranularity,
                periodFrom: 1,
                periodTo: 1,
              })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableGranularities.map((g) => (
                <SelectItem key={g} value={g}>
                  {GRANULARITY_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 期間 */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">期間</Label>
          <div className="flex items-center gap-1">
            <Select
              value={String(filterState.periodFrom)}
              onValueChange={(v) =>
                onFilterChange({ periodFrom: Number(v) })
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((p) => (
                  <SelectItem key={p.value} value={String(p.value)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">〜</span>
            <Select
              value={String(filterState.periodTo)}
              onValueChange={(v) => onFilterChange({ periodTo: Number(v) })}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions
                  .filter((p) => p.value >= filterState.periodFrom)
                  .map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>
                      {p.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compare切替 */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <Switch
            id="compare-toggle"
            checked={filterState.compareEnabled}
            onCheckedChange={(checked) =>
              onFilterChange({ compareEnabled: checked })
            }
          />
          <Label htmlFor="compare-toggle" className="text-sm">
            Compare
          </Label>
        </div>

        {/* Compare設定（有効時のみ） */}
        {filterState.compareEnabled && (
          <>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                比較年度
              </Label>
              <Select
                value={String(filterState.compareFiscalYear || '')}
                onValueChange={(v) =>
                  onFilterChange({ compareFiscalYear: Number(v) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  {options.fiscalYears.map((fy) => (
                    <SelectItem
                      key={fy.fiscalYear}
                      value={String(fy.fiscalYear)}
                    >
                      {fy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                比較種類
              </Label>
              <Select
                value={filterState.compareType || ''}
                onValueChange={(v) =>
                  onFilterChange({
                    compareType: v as RoicPrimaryType,
                    compareEventId: undefined,
                    compareVersionId: undefined,
                  })
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePrimaryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PRIMARY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filterState.compareType !== 'ACTUAL' &&
              compareEvents.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    比較イベント
                  </Label>
                  <Select
                    value={filterState.compareEventId || ''}
                    onValueChange={(v) =>
                      onFilterChange({
                        compareEventId: v,
                        compareVersionId: undefined,
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
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

            {compareVersions.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  比較バージョン
                </Label>
                <Select
                  value={filterState.compareVersionId || ''}
                  onValueChange={(v) =>
                    onFilterChange({ compareVersionId: v })
                  }
                >
                  <SelectTrigger className="w-36">
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
          </>
        )}
      </div>
    </div>
  );
}
