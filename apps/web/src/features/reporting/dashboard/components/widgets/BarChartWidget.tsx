/**
 * Bar Chart Widget
 *
 * Purpose:
 * - Display categorical comparison as bar chart
 * - Support vertical/horizontal orientation
 * - Support stacked mode
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 8)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, BarChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface BarChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Bar Chart Widget Component (Stub)
 * Full implementation with SyncFusion Bar Chart in Phase 2
 */
export function BarChartWidget({ widget, data }: BarChartWidgetProps) {
  const displayConfig = widget.displayConfig as BarChartDisplayConfig;

  return (
    <div className="h-full flex flex-col">
      {/* Chart area placeholder */}
      <div className="flex-1 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center">
        <div className="text-center text-neutral-400">
          <div className="text-sm font-semibold">棒グラフ</div>
          <div className="text-xs mt-1">
            方向: {displayConfig.orientation === 'horizontal' ? '横棒' : '縦棒'}
          </div>
          <div className="text-xs">
            {displayConfig.stacked && '積み上げ: ON'}
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
