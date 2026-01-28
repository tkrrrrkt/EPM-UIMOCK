/**
 * Pie Chart Widget
 *
 * Purpose:
 * - Display composition ratio as pie chart
 * - Support donut mode
 * - Show labels and percentages
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 9)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, PieChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface PieChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Pie Chart Widget Component (Stub)
 * Full implementation with SyncFusion Pie Chart in Phase 2
 */
export function PieChartWidget({ widget, data }: PieChartWidgetProps) {
  const displayConfig = widget.displayConfig as PieChartDisplayConfig;

  return (
    <div className="h-full flex items-center justify-center">
      {/* Chart area placeholder */}
      <div className="w-full h-full bg-neutral-50 rounded border border-neutral-200 flex items-center justify-center">
        <div className="text-center text-neutral-400">
          <div className="text-sm font-semibold">円グラフ</div>
          <div className="text-xs mt-1">
            スタイル: {displayConfig.donut ? 'ドーナツ' : '円'}
          </div>
          <div className="text-xs">
            セグメント数: {data.dataPoints.length}
          </div>
          <div className="text-xs mt-2 text-neutral-300">
            （SyncFusion Charts統合時に実装）
          </div>
        </div>
      </div>
    </div>
  );
}
