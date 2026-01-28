'use client';

import { useState, useCallback } from 'react';
import { Skeleton } from '@/shared/ui';
import { CvpFilters } from './CvpFilters';
import { DepartmentTree } from './DepartmentTree';
import { CvpKpiCards } from './CvpKpiCards';
import { CvpBreakevenChart } from './CvpBreakevenChart';
import { CvpWaterfallChart } from './CvpWaterfallChart';
import { CvpTree } from './CvpTree';
import { LayoutNotSetBlock } from './LayoutNotSetBlock';
import { RequiredFieldsBlock } from './RequiredFieldsBlock';
import { NoDataBlock } from './NoDataBlock';
import { useCvpOptions } from '../hooks/useCvpOptions';
import { useCvpData } from '../hooks/useCvpData';
import { useCvpSimulation } from '../hooks/useCvpSimulation';
import type { CvpFilterState, CvpGranularity } from '../types';

const COMPANY_ID = 'company-001'; // This would come from context/props in real app

const initialFilters: CvpFilterState = {
  fiscalYear: null,
  primaryType: null,
  primaryEventId: null,
  primaryVersionId: null,
  compareEnabled: false,
  compareFiscalYear: null,
  compareType: null,
  compareEventId: null,
  compareVersionId: null,
  periodFrom: 4, // April (Japanese fiscal year)
  periodTo: 3,   // March
  granularity: 'MONTHLY' as CvpGranularity,
  departmentStableId: null,
  includeSubDepartments: true,
};

export function CvpDashboard() {
  const [filters, setFilters] = useState<CvpFilterState>(initialFilters);

  const { options, isLoading: optionsLoading } = useCvpOptions(COMPANY_ID);
  const { data, isLoading: dataLoading, isReady } = useCvpData(COMPANY_ID, filters);
  const {
    tree,
    kpis,
    breakevenChart,
    waterfallSimulated,
    hasChanges,
    onValueChange,
    onReset,
  } = useCvpSimulation(data);

  const handleFilterChange = useCallback((updates: Partial<CvpFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleDepartmentSelect = useCallback((stableId: string) => {
    setFilters((prev) => ({ ...prev, departmentStableId: stableId }));
  }, []);

  const handleIncludeSubDepartmentsChange = useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, includeSubDepartments: value }));
  }, []);

  // Loading state
  if (optionsLoading) {
    return <DashboardSkeleton />;
  }

  // Layout not set
  if (options && !options.cvpLayoutId) {
    return <LayoutNotSetBlock />;
  }

  // Options loaded
  if (!options) {
    return <DashboardSkeleton />;
  }

  const isFiltersComplete =
    filters.fiscalYear &&
    filters.primaryType &&
    filters.departmentStableId &&
    filters.granularity;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <CvpFilters options={options} filters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-12 gap-4">
        {/* Department Tree - Left sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="h-[600px]">
            <DepartmentTree
              departments={options.departments}
              selectedStableId={filters.departmentStableId}
              includeSubDepartments={filters.includeSubDepartments}
              onSelect={handleDepartmentSelect}
              onIncludeSubDepartmentsChange={handleIncludeSubDepartmentsChange}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {!isFiltersComplete ? (
            <RequiredFieldsBlock />
          ) : dataLoading ? (
            <ContentSkeleton />
          ) : !data || (data.kpis.length === 0 && data.tree.length === 0) ? (
            <NoDataBlock />
          ) : (
            <>
              {/* KPI Cards */}
              <CvpKpiCards kpis={kpis} compareEnabled={filters.compareEnabled} />

              {/* Charts row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CvpBreakevenChart data={breakevenChart} />
                <CvpWaterfallChart
                  primaryData={waterfallSimulated}
                  compareData={data.waterfallCompare}
                  compareEnabled={filters.compareEnabled}
                />
              </div>

              {/* CVP Tree */}
              <CvpTree
                tree={tree}
                hasChanges={hasChanges}
                onValueChange={onValueChange}
                onReset={onReset}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="col-span-9 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
