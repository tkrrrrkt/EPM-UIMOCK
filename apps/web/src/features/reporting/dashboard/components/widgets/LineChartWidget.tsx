/**
 * Line Chart Widget
 *
 * Purpose:
 * - Display time series data as line chart
 * - Support multiple series
 * - Show comparison series
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 7)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, LineChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface LineChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Line Chart Widget Component (Stub)
 * Full implementation with SyncFusion Line Chart in Phase 2
 */
export function LineChartWidget({ widget, data }: LineChartWidgetProps) {
  const displayConfig = widget.displayConfig as LineChartDisplayConfig;

  return (
    <div className="h-full flex flex-col">
      {/* Chart area placeholder */}
      <div className="flex-1 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center">
        <div className="text-center text-neutral-400">
          <div className="text-sm font-semibold">折れ線チャート</div>
          <div className="text-xs mt-1">
            データポイント数: {data.dataPoints.length}
          </div>
          <div className="text-xs">
            {displayConfig.showLegend && '凡例表示: ON'}
          </div>
          <div className="text-xs mt-2 text-neutral-300">
            （SyncFusion Charts統合時に実装）
          </div>
        </div>
      </div>

      {/* Legend placeholder */}
      {displayConfig.showLegend && (
        <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-neutral-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-500 rounded"></div>
            <span>Primary</span>
          </div>
          {data.dataPoints.some(dp => dp.compareValue !== undefined) && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-secondary-500 rounded"></div>
              <span>Compare</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
