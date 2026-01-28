/**
 * Gauge Widget
 *
 * Purpose:
 * - Display KPI achievement rate as gauge
 * - Show current value, target, and percentage
 * - Color-coded by thresholds
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 10)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, GaugeDisplayConfig } from '@epm/contracts/bff/dashboard';

interface GaugeWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Gauge Widget Component (Stub)
 * Full implementation with SyncFusion Circular Gauge in Phase 2
 */
export function GaugeWidget({ widget, data }: GaugeWidgetProps) {
  const displayConfig = widget.displayConfig as GaugeDisplayConfig;
  const latestDataPoint = data.dataPoints[data.dataPoints.length - 1];
  const value = latestDataPoint?.value ?? 0;

  // Mock achievement rate calculation
  const achievementRate = 85; // Placeholder

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Gauge placeholder */}
      <div className="w-48 h-48 bg-neutral-50 rounded-full border-4 border-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">{achievementRate}%</div>
          <div className="text-sm text-neutral-600 mt-1">達成率</div>
        </div>
      </div>

      {/* Value display */}
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-neutral-900">
          {value.toLocaleString('ja-JP')} {data.unit || ''}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          スタイル: {displayConfig.style === 'half' ? '半円' : '全円'}
        </div>
      </div>

      <div className="text-xs text-neutral-300 mt-4">
        （SyncFusion Gauge統合時に実装）
      </div>
    </div>
  );
}
