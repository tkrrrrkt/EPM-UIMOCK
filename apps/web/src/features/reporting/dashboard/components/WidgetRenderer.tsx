/**
 * Widget Renderer
 *
 * Purpose:
 * - Render individual widgets based on widget type
 * - Fetch and manage widget data
 * - Display loading/error states per widget
 * - Support widget refresh
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 2.2, 2.5, 2.6)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button } from '@/shared/ui';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { bffClient } from '../api/client';
import type {
  BffWidgetDto,
  GlobalFilterConfig,
  BffWidgetDataRequestDto,
  BffWidgetDataResponseDto,
} from '@epm/contracts/bff/dashboard';

// Import widget components (will be created as stubs)
import { KpiCardWidget } from './widgets/KpiCardWidget';
import { LineChartWidget } from './widgets/LineChartWidget';
import { BarChartWidget } from './widgets/BarChartWidget';
import { PieChartWidget } from './widgets/PieChartWidget';
import { GaugeWidget } from './widgets/GaugeWidget';
import { TableWidget } from './widgets/TableWidget';
import { TextWidget } from './widgets/TextWidget';
import { CompositeChartWidget } from './widgets/CompositeChartWidget';

interface WidgetRendererProps {
  widget: BffWidgetDto;
  dashboardId: string;
  globalFilter: GlobalFilterConfig | null;
}

/**
 * Widget Renderer Component
 * Fetches widget data and renders appropriate widget type
 */
export function WidgetRenderer({ widget, dashboardId, globalFilter }: WidgetRendererProps) {
  const [data, setData] = useState<BffWidgetDataResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Resolve filter: widget filter overrides global filter
  const resolveFilter = useCallback((): BffWidgetDataRequestDto | null => {
    if (!globalFilter) return null;

    const effectiveFilter = widget.filterConfig.useGlobal
      ? globalFilter
      : { ...globalFilter, ...widget.filterConfig.overrides };

    return {
      resolvedFilter: {
        fiscalYear: effectiveFilter.fiscalYear || new Date().getFullYear(),
        departmentStableId: effectiveFilter.departmentStableId || '',
        includeChildren: effectiveFilter.includeChildren || false,
        periodStart: effectiveFilter.periodStart || `${new Date().getFullYear()}01`,
        periodEnd: effectiveFilter.periodEnd || `${new Date().getFullYear()}12`,
        displayGranularity: effectiveFilter.displayGranularity || 'MONTHLY',
        primaryScenarioType: effectiveFilter.primary?.scenarioType || 'ACTUAL',
        primaryPlanEventId: effectiveFilter.primary?.planEventId,
        primaryPlanVersionId: effectiveFilter.primary?.planVersionId,
        compareEnabled: effectiveFilter.compare?.enabled || false,
        compareScenarioType: effectiveFilter.compare?.scenarioType,
        comparePlanEventId: effectiveFilter.compare?.planEventId,
        comparePlanVersionId: effectiveFilter.compare?.planVersionId,
      },
    };
  }, [widget, globalFilter]);

  // Fetch widget data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const request = resolveFilter();
      if (!request) {
        throw new Error('Global filter is not configured');
      }

      const response = await bffClient.getWidgetData(dashboardId, widget.id, request);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch widget data'));
    } finally {
      setLoading(false);
    }
  }, [dashboardId, widget.id, resolveFilter]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render widget content based on type
  const renderWidgetContent = () => {
    if (!data) return null;

    const props = { widget, data };

    switch (widget.widgetType) {
      case 'KPI_CARD':
        return <KpiCardWidget {...props} />;
      case 'LINE_CHART':
        return <LineChartWidget {...props} />;
      case 'BAR_CHART':
        return <BarChartWidget {...props} />;
      case 'PIE_CHART':
        return <PieChartWidget {...props} />;
      case 'GAUGE':
        return <GaugeWidget {...props} />;
      case 'TABLE':
        return <TableWidget {...props} />;
      case 'TEXT':
        return <TextWidget {...props} />;
      case 'COMPOSITE_CHART':
        return <CompositeChartWidget {...props} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <div className="text-center">
              <div className="text-sm">未対応のウィジェットタイプ</div>
              <div className="text-xs mt-1">{widget.widgetType}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="p-4 h-full flex flex-col overflow-hidden border-neutral-200">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{widget.title}</h3>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {widget.widgetType}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="text-neutral-600 hover:text-neutral-900 flex-shrink-0"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Widget Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-neutral-600">データ読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-error-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-semibold">データ取得エラー</p>
              <p className="text-xs mt-1 text-neutral-600">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="mt-3"
              >
                再試行
              </Button>
            </div>
          </div>
        ) : (
          renderWidgetContent()
        )}
      </div>
    </Card>
  );
}
