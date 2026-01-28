/**
 * Composite Chart Widget
 *
 * Purpose:
 * - Display multiple chart types in single widget
 * - Support dual Y-axis
 * - Combine line and bar charts
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 13)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, CompositeChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface CompositeChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Composite Chart Widget Component (Stub)
 * Full implementation with SyncFusion Charts in Phase 2
 */
export function CompositeChartWidget({ widget, data }: CompositeChartWidgetProps) {
  const displayConfig = widget.displayConfig as CompositeChartDisplayConfig;

  return (
    <div className="h-full flex flex-col">
      {/* Chart area placeholder */}
      <div className="flex-1 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center">
        <div className="text-center text-neutral-400">
          <div className="text-sm font-semibold">複合チャート</div>
          <div className="text-xs mt-1">
            主軸: {displayConfig.primaryAxis || 'left'}
          </div>
          <div className="text-xs">
            副軸: {displayConfig.secondaryAxis || 'right'}
          </div>
          <div className="text-xs">
            データポイント数: {data.dataPoints.length}
          </div>
          <div className="text-xs mt-2 text-neutral-300">
            （SyncFusion Charts統合時に実装）
          </div>
        </div>
      </div>
    </div>
  );
}
