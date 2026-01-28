/**
 * KPI Card Widget
 *
 * Purpose:
 * - Display KPI value in card format
 * - Show comparison value and difference
 * - Optional sparkline for trend
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 6)
 */
'use client';

import { Card } from '@/shared/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SparklineComponent } from '@syncfusion/ej2-react-charts';
import type { BffWidgetDto, BffWidgetDataResponseDto, KpiCardDisplayConfig } from '@epm/contracts/bff/dashboard';

interface KpiCardWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * KPI Card Widget Component
 * Displays single KPI value with comparison
 */
export function KpiCardWidget({ widget, data }: KpiCardWidgetProps) {
  const displayConfig = widget.displayConfig as KpiCardDisplayConfig;
  const latestDataPoint = data.dataPoints[data.dataPoints.length - 1];
  const value = latestDataPoint?.value ?? 0;
  const difference = data.difference;

  // Format number with commas
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return num.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  };

  // Determine color based on difference
  const getDifferenceColor = () => {
    if (!difference || difference.rate === null) return 'text-neutral-600';
    return difference.rate >= 0 ? 'text-success-600' : 'text-error-600';
  };

  const DifferenceIcon = !difference || difference.rate === null
    ? null
    : difference.rate >= 0
    ? TrendingUp
    : TrendingDown;

  return (
    <Card className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-primary-50 to-white border-primary-200">
      {/* Value */}
      <div>
        <div className="text-4xl font-bold text-neutral-900 mb-1">
          {formatNumber(value)}
        </div>
        <div className="text-sm text-neutral-600">{data.unit || ''}</div>
      </div>

      {/* Comparison */}
      {displayConfig.showCompare && difference && (
        <div className={`flex items-center space-x-2 mt-4 ${getDifferenceColor()}`}>
          {DifferenceIcon && <DifferenceIcon className="h-4 w-4" />}
          <div className="text-lg font-semibold">
            {difference.rate !== null ? `${difference.rate > 0 ? '+' : ''}${difference.rate}%` : '-'}
          </div>
          <div className="text-sm">
            ({difference.value !== null ? formatNumber(difference.value) : '-'})
          </div>
        </div>
      )}

      {/* Sparkline */}
      {displayConfig.showSparkline && data.dataPoints.length > 1 && (
        <div className="mt-4 h-12">
          <SparklineComponent
            height="48px"
            width="100%"
            lineWidth={2}
            type="Line"
            fill={!difference || difference.rate === null || difference.rate >= 0 ? '#10b981' : '#ef4444'}
            dataSource={data.dataPoints.map(dp => ({ x: dp.label, y: dp.value }))}
            xName="x"
            yName="y"
          />
        </div>
      )}

      {/* Meta info */}
      {data.meta?.sourceName && (
        <div className="mt-4 text-xs text-neutral-500">
          {data.meta.sourceName}
        </div>
      )}
    </Card>
  );
}
