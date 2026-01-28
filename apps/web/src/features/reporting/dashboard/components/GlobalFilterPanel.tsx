/**
 * Global Filter Panel
 *
 * Purpose:
 * - Display and manage global filter settings
 * - Fiscal year, department, period range, granularity
 * - Primary/Compare scenario selection
 * - Trigger widget data refresh on filter change
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 4)
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Checkbox,
  Switch,
  Button,
} from '@/shared/ui';
import { Filter, RefreshCw } from 'lucide-react';
import { useDashboardSelectors } from '../hooks/useDashboardSelectors';
import type {
  GlobalFilterConfig,
  ScenarioType,
  DisplayGranularity,
} from '@epm/contracts/bff/dashboard';

interface GlobalFilterPanelProps {
  config: GlobalFilterConfig;
  onChange: (config: GlobalFilterConfig) => void;
  onRefresh: () => void;
}

const SCENARIO_TYPES: { value: ScenarioType; label: string }[] = [
  { value: 'ACTUAL', label: '実績' },
  { value: 'BUDGET', label: '予算' },
  { value: 'FORECAST', label: '予測' },
];

const DISPLAY_GRANULARITIES: { value: DisplayGranularity; label: string }[] = [
  { value: 'MONTHLY', label: '月次' },
  { value: 'QUARTERLY', label: '四半期' },
  { value: 'HALF_YEARLY', label: '半期' },
  { value: 'YEARLY', label: '年次' },
];

/**
 * Global Filter Panel Component
 */
export function GlobalFilterPanel({ config, onChange, onRefresh }: GlobalFilterPanelProps) {
  const { selectors, loading } = useDashboardSelectors();
  const [localConfig, setLocalConfig] = useState<GlobalFilterConfig>(config);
  const [compareEnabled, setCompareEnabled] = useState(config.compare?.enabled || false);

  // Sync local config with prop config
  useEffect(() => {
    setLocalConfig(config);
    setCompareEnabled(config.compare?.enabled || false);
  }, [config]);

  // Update config field
  const updateField = <K extends keyof GlobalFilterConfig>(
    field: K,
    value: GlobalFilterConfig[K]
  ) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update primary scenario
  const updatePrimaryScenario = (scenarioType: ScenarioType) => {
    const newConfig = {
      ...localConfig,
      primary: {
        scenarioType,
        planEventId: undefined,
        planVersionId: undefined,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update primary event
  const updatePrimaryEvent = (eventId: string) => {
    const newConfig = {
      ...localConfig,
      primary: {
        ...localConfig.primary!,
        planEventId: eventId,
        planVersionId: undefined,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update primary version
  const updatePrimaryVersion = (versionId: string) => {
    const newConfig = {
      ...localConfig,
      primary: {
        ...localConfig.primary!,
        planVersionId: versionId,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Toggle compare
  const toggleCompare = (enabled: boolean) => {
    setCompareEnabled(enabled);
    const newConfig = {
      ...localConfig,
      compare: enabled
        ? {
            enabled: true,
            scenarioType: localConfig.compare?.scenarioType || 'BUDGET',
          }
        : { enabled: false },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update compare scenario
  const updateCompareScenario = (scenarioType: ScenarioType) => {
    const newConfig = {
      ...localConfig,
      compare: {
        ...localConfig.compare!,
        enabled: true,
        scenarioType,
        planEventId: undefined,
        planVersionId: undefined,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update compare event
  const updateCompareEvent = (eventId: string) => {
    const newConfig = {
      ...localConfig,
      compare: {
        ...localConfig.compare!,
        enabled: true,
        planEventId: eventId,
        planVersionId: undefined,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Update compare version
  const updateCompareVersion = (versionId: string) => {
    const newConfig = {
      ...localConfig,
      compare: {
        ...localConfig.compare!,
        enabled: true,
        planVersionId: versionId,
      },
    };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  // Show event selector for BUDGET/FORECAST
  const showPrimaryEvent =
    localConfig.primary?.scenarioType === 'BUDGET' ||
    localConfig.primary?.scenarioType === 'FORECAST';

  // Show version selector for BUDGET
  const showPrimaryVersion = localConfig.primary?.scenarioType === 'BUDGET';

  // Show compare event selector
  const showCompareEvent =
    compareEnabled &&
    localConfig.compare &&
    (localConfig.compare.scenarioType === 'BUDGET' ||
      localConfig.compare.scenarioType === 'FORECAST');

  // Show compare version selector
  const showCompareVersion =
    compareEnabled &&
    localConfig.compare &&
    localConfig.compare.scenarioType === 'BUDGET';

  // Filter events by scenario type
  const getPrimaryEvents = () => {
    if (!selectors?.planEvents) return [];
    return selectors.planEvents.filter(
      (e) => e.scenarioType === localConfig.primary?.scenarioType
    );
  };

  const getCompareEvents = () => {
    if (!selectors?.planEvents || !localConfig.compare) return [];
    return selectors.planEvents.filter(
      (e) => e.scenarioType === localConfig.compare!.scenarioType
    );
  };

  // Filter versions by event
  const getPrimaryVersions = () => {
    if (!selectors?.planVersions || !localConfig.primary?.planEventId) return [];
    return selectors.planVersions;
  };

  const getCompareVersions = () => {
    if (!selectors?.planVersions || !localConfig.compare?.planEventId) return [];
    return selectors.planVersions;
  };

  return (
    <Card className="p-6 border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-neutral-900">グローバルフィルター</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-neutral-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-500">選択肢を読み込み中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fiscal Year */}
          <div className="space-y-2">
            <Label htmlFor="fiscalYear" className="text-sm font-medium text-neutral-700">
              年度
            </Label>
            <Select
              value={localConfig.fiscalYear?.toString()}
              onValueChange={(value) => updateField('fiscalYear', parseInt(value, 10))}
            >
              <SelectTrigger id="fiscalYear">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {selectors?.fiscalYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年度
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-neutral-700">
              部門
            </Label>
            <Select
              value={localConfig.departmentStableId}
              onValueChange={(value) => updateField('departmentStableId', value)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="部門を選択" />
              </SelectTrigger>
              <SelectContent>
                {selectors?.departments.map((dept) => (
                  <SelectItem key={dept.stableId} value={dept.stableId}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Children */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">配下を含む</Label>
            <div className="flex items-center h-10 space-x-2">
              <Checkbox
                id="includeChildren"
                checked={localConfig.includeChildren}
                onCheckedChange={(checked) =>
                  updateField('includeChildren', checked === true)
                }
              />
              <Label
                htmlFor="includeChildren"
                className="text-sm font-normal text-neutral-600 cursor-pointer"
              >
                配下部門を含める
              </Label>
            </div>
          </div>

          {/* Display Granularity */}
          <div className="space-y-2">
            <Label htmlFor="granularity" className="text-sm font-medium text-neutral-700">
              表示粒度
            </Label>
            <Select
              value={localConfig.displayGranularity}
              onValueChange={(value) =>
                updateField('displayGranularity', value as DisplayGranularity)
              }
            >
              <SelectTrigger id="granularity">
                <SelectValue placeholder="粒度を選択" />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_GRANULARITIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Scenario */}
          <div className="space-y-2">
            <Label htmlFor="primaryScenario" className="text-sm font-medium text-neutral-700">
              Primaryシナリオ
            </Label>
            <Select
              value={localConfig.primary?.scenarioType}
              onValueChange={(value) => updatePrimaryScenario(value as ScenarioType)}
            >
              <SelectTrigger id="primaryScenario">
                <SelectValue placeholder="シナリオを選択" />
              </SelectTrigger>
              <SelectContent>
                {SCENARIO_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Event (conditional) */}
          {showPrimaryEvent && (
            <div className="space-y-2">
              <Label htmlFor="primaryEvent" className="text-sm font-medium text-neutral-700">
                Primaryイベント
              </Label>
              <Select
                value={localConfig.primary?.planEventId}
                onValueChange={updatePrimaryEvent}
              >
                <SelectTrigger id="primaryEvent">
                  <SelectValue placeholder="イベントを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getPrimaryEvents().map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Primary Version (conditional) */}
          {showPrimaryVersion && localConfig.primary?.planEventId && (
            <div className="space-y-2">
              <Label htmlFor="primaryVersion" className="text-sm font-medium text-neutral-700">
                Primaryバージョン
              </Label>
              <Select
                value={localConfig.primary?.planVersionId}
                onValueChange={updatePrimaryVersion}
              >
                <SelectTrigger id="primaryVersion">
                  <SelectValue placeholder="バージョンを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getPrimaryVersions().map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compare Toggle */}
          <div className="space-y-2">
            <Label htmlFor="compareToggle" className="text-sm font-medium text-neutral-700">
              比較モード
            </Label>
            <div className="flex items-center h-10 space-x-2">
              <Switch
                id="compareToggle"
                checked={compareEnabled}
                onCheckedChange={toggleCompare}
              />
              <Label
                htmlFor="compareToggle"
                className="text-sm font-normal text-neutral-600 cursor-pointer"
              >
                比較を有効化
              </Label>
            </div>
          </div>

          {/* Compare Scenario (conditional) */}
          {compareEnabled && (
            <div className="space-y-2">
              <Label htmlFor="compareScenario" className="text-sm font-medium text-neutral-700">
                Compareシナリオ
              </Label>
              <Select
                value={localConfig.compare?.scenarioType}
                onValueChange={(value) => updateCompareScenario(value as ScenarioType)}
              >
                <SelectTrigger id="compareScenario">
                  <SelectValue placeholder="シナリオを選択" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIO_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compare Event (conditional) */}
          {showCompareEvent && (
            <div className="space-y-2">
              <Label htmlFor="compareEvent" className="text-sm font-medium text-neutral-700">
                Compareイベント
              </Label>
              <Select
                value={localConfig.compare?.planEventId}
                onValueChange={updateCompareEvent}
              >
                <SelectTrigger id="compareEvent">
                  <SelectValue placeholder="イベントを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getCompareEvents().map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compare Version (conditional) */}
          {showCompareVersion && localConfig.compare?.planEventId && (
            <div className="space-y-2">
              <Label htmlFor="compareVersion" className="text-sm font-medium text-neutral-700">
                Compareバージョン
              </Label>
              <Select
                value={localConfig.compare?.planVersionId}
                onValueChange={updateCompareVersion}
              >
                <SelectTrigger id="compareVersion">
                  <SelectValue placeholder="バージョンを選択" />
                </SelectTrigger>
                <SelectContent>
                  {getCompareVersions().map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
