'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, GitBranch, Sliders, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from '@/shared/ui';
import { cn } from '@/lib/utils';
import { RoicFilters } from './RoicFilters';
import { DepartmentTree } from './DepartmentTree';
import { RoicKpiCards } from './RoicKpiCards';
import { RoicVsWaccChart } from './RoicVsWaccChart';
import { RoicDecompositionBar } from './RoicDecompositionBar';
import { RoicTree } from './RoicTree';
import { DuPontWaterfall } from './DuPontWaterfall';
import { RoicTreemap } from './RoicTreemap';
import { RoicTreeGrid } from './RoicTreeGrid';
import { RoicSimulationSliders } from './RoicSimulationSliders';
import { RoicAmountBreakdown } from './RoicAmountBreakdown';
import { RoicExecutiveSummary } from './RoicExecutiveSummary';
import { SimpleInputPanel } from './SimpleInputPanel';
import { WarningBanner } from './WarningBanner';
import { ConfigErrorBlock } from './ConfigErrorBlock';
import { NoDataBlock } from './NoDataBlock';
import { RequiredFieldsBlock } from './RequiredFieldsBlock';
import { bffClient } from '../api';
import type {
  BffRoicOptionsResponse,
  BffRoicDataResponse,
  BffRoicSimpleInputResponse,
  RoicFilterState,
  SimulatedValues,
  BffRoicSimpleInputSaveItem,
} from '../types';
import { recalculateParents, resetSimulatedValues } from '../lib/tree-utils';

interface RoicDashboardProps {
  companyId: string;
}

type TabValue = 'overview' | 'decomposition' | 'simulation';

export function RoicDashboard({ companyId }: RoicDashboardProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  // Options state
  const [options, setOptions] = useState<BffRoicOptionsResponse | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Data state
  const [data, setData] = useState<BffRoicDataResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Simple Input state
  const [simpleInputOpen, setSimpleInputOpen] = useState(false);
  const [simpleInputData, setSimpleInputData] =
    useState<BffRoicSimpleInputResponse | null>(null);
  const [simpleInputLoading, setSimpleInputLoading] = useState(false);

  // Filter state
  const [filterState, setFilterState] = useState<RoicFilterState>({
    fiscalYear: 2025,
    primaryType: 'ACTUAL',
    compareEnabled: false,
    periodFrom: 1,
    periodTo: 4,
    granularity: 'QUARTERLY',
    departmentStableId: 'CORP',
    includeSubDepartments: false,
  });

  // Simulation state
  const [simulatedValues, setSimulatedValues] = useState<SimulatedValues>({});

  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        const result = await bffClient.getOptions({ companyId });
        setOptions(result);

        // 初期フィルター設定
        if (result.fiscalYears.length > 0) {
          setFilterState((prev) => ({
            ...prev,
            fiscalYear: result.fiscalYears[0].fiscalYear,
          }));
        }
        if (result.departments.length > 0) {
          setFilterState((prev) => ({
            ...prev,
            departmentStableId: result.departments[0].stableId,
          }));
        }
        // 簡易モードの場合、制限を適用
        if (result.mode === 'SIMPLIFIED') {
          setFilterState((prev) => ({
            ...prev,
            primaryType: 'ACTUAL',
            granularity: 'SEMI_ANNUAL',
            periodFrom: 1,
            periodTo: 2,
          }));
        }
      } catch (err) {
        setOptionsError(
          err instanceof Error ? err.message : 'オプションの読み込みに失敗しました'
        );
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, [companyId]);

  // Load data when filter changes
  useEffect(() => {
    if (!options) return;

    // Primary選択チェック（BUDGET/FORECASTの場合はイベント必須）
    if (filterState.primaryType !== 'ACTUAL' && !filterState.primaryEventId) {
      setData(null);
      return;
    }

    const loadData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        const result = await bffClient.getData({
          companyId,
          ...filterState,
        });
        setData(result);
        // データ更新時にシミュレーションリセット
        setSimulatedValues({});
      } catch (err) {
        setDataError(
          err instanceof Error ? err.message : 'データの読み込みに失敗しました'
        );
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [companyId, options, filterState]);

  // Handle filter change
  const handleFilterChange = useCallback((partial: Partial<RoicFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  // Handle department selection
  const handleDepartmentSelect = useCallback((stableId: string) => {
    setFilterState((prev) => ({
      ...prev,
      departmentStableId: stableId,
    }));
  }, []);

  // Handle sub-departments toggle
  const handleSubDepartmentsToggle = useCallback((include: boolean) => {
    setFilterState((prev) => ({
      ...prev,
      includeSubDepartments: include,
    }));
  }, []);

  // Handle tree value change
  const handleTreeValueChange = useCallback(
    (lineId: string, value: number) => {
      if (!data) return;

      setSimulatedValues((prev) => {
        const newValues = { ...prev, [lineId]: value };
        // 親を再計算
        return recalculateParents(data.tree, lineId, newValues);
      });
    },
    [data]
  );

  // Handle simulation reset
  const handleReset = useCallback(() => {
    setSimulatedValues(resetSimulatedValues());
  }, []);

  // Handle simple input open
  const handleOpenSimpleInput = useCallback(async () => {
    setSimpleInputOpen(true);
    setSimpleInputLoading(true);
    try {
      const result = await bffClient.getSimpleInput({
        companyId,
        fiscalYear: filterState.fiscalYear,
        departmentStableId: filterState.departmentStableId,
      });
      setSimpleInputData(result);
    } catch (err) {
      console.error('Simple input load error:', err);
    } finally {
      setSimpleInputLoading(false);
    }
  }, [companyId, filterState.fiscalYear, filterState.departmentStableId]);

  // Handle simple input save
  const handleSimpleInputSave = useCallback(
    async (
      operatingAssets: BffRoicSimpleInputSaveItem[],
      operatingLiabilities: BffRoicSimpleInputSaveItem[]
    ) => {
      await bffClient.saveSimpleInput({
        companyId,
        fiscalYear: filterState.fiscalYear,
        departmentStableId: filterState.departmentStableId,
        operatingAssets,
        operatingLiabilities,
      });
      // リフレッシュ
      setFilterState((prev) => ({ ...prev }));
    },
    [companyId, filterState.fiscalYear, filterState.departmentStableId]
  );

  // Loading state
  if (optionsLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r border-border p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-16 w-full" />
          <div className="mt-6 grid grid-cols-4 gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Options error
  if (optionsError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-destructive">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-medium">エラーが発生しました</p>
          <p className="mt-2 text-sm text-muted-foreground">{optionsError}</p>
        </div>
      </div>
    );
  }

  // Config not complete
  if (options && !options.isConfigComplete) {
    return <ConfigErrorBlock missingConfigItems={options.missingConfigItems} />;
  }

  if (!options) return null;

  const hasSimulation = Object.keys(simulatedValues).length > 0;
  const needsPrimarySelection =
    filterState.primaryType !== 'ACTUAL' && !filterState.primaryEventId;

  // ROIC値を取得
  const roicValue = data?.kpis.find((k) => k.id === 'roic')?.originalValue ?? 0;
  const waccValue = data?.roicVsWaccChart.waccRate ?? null;
  const roicAboveWacc =
    waccValue !== null ? roicValue > waccValue : null;

  return (
    <div className="flex h-screen bg-background">
      {/* 左サイドバー: 部門ツリー */}
      <div className="w-64 flex-shrink-0 border-r border-border">
        <DepartmentTree
          departments={options.departments}
          selectedDepartmentId={filterState.departmentStableId}
          includeSubDepartments={filterState.includeSubDepartments}
          mode={options.mode}
          onSelectDepartment={handleDepartmentSelect}
          onToggleSubDepartments={handleSubDepartmentsToggle}
          onOpenSimpleInput={
            options.mode === 'SIMPLIFIED' ? handleOpenSimpleInput : undefined
          }
        />
      </div>

      {/* メインエリア */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* ヘッダー部分：フィルター + タブ */}
          <div className="space-y-4">
            {/* フィルターパネル */}
            <RoicFilters
              options={options}
              filterState={filterState}
              onFilterChange={handleFilterChange}
            />

            {/* 警告バナー */}
            {data && (data.warnings.length > 0 || data.bsSubstitutedWithActual) && (
              <WarningBanner
                warnings={data.warnings}
                bsSubstitutedWithActual={data.bsSubstitutedWithActual}
              />
            )}
          </div>

          {/* コンテンツエリア */}
          <div className="mt-6">
            {needsPrimarySelection ? (
              <RequiredFieldsBlock />
            ) : dataLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
                <Skeleton className="h-72 w-full" />
              </div>
            ) : dataError ? (
              <NoDataBlock message={dataError} />
            ) : data && data.kpis.length > 0 ? (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                {/* タブヘッダー */}
                <div className="mb-6 flex items-center justify-between">
                  <TabsList className="grid w-auto grid-cols-3 gap-1">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>概要</span>
                    </TabsTrigger>
                    <TabsTrigger value="decomposition" className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span>分解分析</span>
                    </TabsTrigger>
                    <TabsTrigger value="simulation" className="flex items-center gap-2">
                      <Sliders className="h-4 w-4" />
                      <span>シミュレーション</span>
                      {hasSimulation && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                          !
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* ROICステータス表示 */}
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2',
                      roicAboveWacc === null
                        ? 'bg-muted/30 text-muted-foreground'
                        : roicAboveWacc
                        ? 'bg-chart-3/10 text-chart-3'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {roicAboveWacc === null ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : roicAboveWacc ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      ROIC {(roicValue * 100).toFixed(1)}% /
                      WACC {waccValue !== null ? `${(waccValue * 100).toFixed(1)}%` : '未設定'}
                    </span>
                    <Badge
                      variant={
                        roicAboveWacc === null
                          ? 'secondary'
                          : roicAboveWacc
                          ? 'default'
                          : 'destructive'
                      }
                      className="ml-2"
                    >
                      {roicAboveWacc === null ? '判定保留' : roicAboveWacc ? '価値創造' : '要改善'}
                    </Badge>
                  </div>
                </div>

                {/* 概要タブ */}
                <TabsContent value="overview" className="space-y-6">
                  <RoicExecutiveSummary
                    kpis={data.kpis}
                    waccRate={data.roicVsWaccChart.waccRate}
                    hasWarnings={data.warnings.length > 0}
                    bsSubstituted={data.bsSubstitutedWithActual}
                    compareEnabled={filterState.compareEnabled}
                  />

                  {/* KPIカード */}
                  <RoicKpiCards
                    kpis={data.kpis}
                    simulatedValues={simulatedValues}
                    compareEnabled={filterState.compareEnabled}
                  />

                  {/* DuPont分析 + グラフ */}
                  <div className="grid gap-6 xl:grid-cols-2">
                    <DuPontWaterfall
                      kpis={data.kpis}
                      waccRate={data.roicVsWaccChart.waccRate}
                    />
                    <RoicVsWaccChart
                      chartData={data.roicVsWaccChart}
                      compareEnabled={filterState.compareEnabled}
                      hasSimulation={hasSimulation}
                    />
                  </div>

                  {/* ROIC分解棒グラフ */}
                  <RoicDecompositionBar
                    chartData={data.decompositionChart}
                    compareEnabled={filterState.compareEnabled}
                    hasSimulation={hasSimulation}
                  />
                </TabsContent>

                {/* 分解分析タブ */}
                <TabsContent value="decomposition" className="space-y-6">
                  {/* Treemap + 金額内訳 */}
                  <div className="grid gap-6 xl:grid-cols-2">
                    <RoicTreemap tree={data.tree} />
                    <RoicAmountBreakdown
                      tree={data.tree}
                      simulatedValues={simulatedValues}
                      compareEnabled={filterState.compareEnabled}
                    />
                  </div>

                  {/* SyncFusion TreeGrid */}
                  <RoicTreeGrid
                    tree={data.tree}
                    simulatedValues={simulatedValues}
                    compareEnabled={filterState.compareEnabled}
                    onValueChange={handleTreeValueChange}
                  />
                </TabsContent>

                {/* シミュレーションタブ */}
                <TabsContent value="simulation" className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* 左：スライダーコントロール */}
                    <RoicSimulationSliders
                      kpis={data.kpis}
                      tree={data.tree}
                      waccRate={data.roicVsWaccChart.waccRate}
                      simulatedValues={simulatedValues}
                      onValueChange={handleTreeValueChange}
                      onReset={handleReset}
                    />

                    {/* 右：従来のツリービュー */}
                    <div className="space-y-6">
                      <RoicVsWaccChart
                        chartData={data.roicVsWaccChart}
                        compareEnabled={filterState.compareEnabled}
                        hasSimulation={hasSimulation}
                      />
                      <RoicTree
                        tree={data.tree}
                        simulatedValues={simulatedValues}
                        compareEnabled={filterState.compareEnabled}
                        onValueChange={handleTreeValueChange}
                        onReset={handleReset}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <NoDataBlock />
            )}
          </div>
        </div>
      </div>

      {/* 簡易入力パネル */}
      <SimpleInputPanel
        open={simpleInputOpen}
        onOpenChange={setSimpleInputOpen}
        fiscalYear={filterState.fiscalYear}
        simpleInputData={simpleInputData}
        isLoading={simpleInputLoading}
        includeSubDepartments={filterState.includeSubDepartments}
        onSave={handleSimpleInputSave}
      />
    </div>
  );
}
