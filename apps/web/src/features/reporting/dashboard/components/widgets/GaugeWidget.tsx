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

import {
  CircularGaugeComponent,
  AxesDirective,
  AxisDirective,
  Inject,
  PointersDirective,
  PointerDirective,
  RangesDirective,
  RangeDirective,
  Annotations,
} from '@syncfusion/ej2-react-circulargauge';
import type { BffWidgetDto, BffWidgetDataResponseDto, GaugeDisplayConfig } from '@epm/contracts/bff/dashboard';

interface GaugeWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Gauge Widget Component
 * Displays KPI achievement rate as circular gauge with SyncFusion CircularGauge
 */
export function GaugeWidget({ widget, data }: GaugeWidgetProps) {
  const displayConfig = widget.displayConfig as GaugeDisplayConfig;
  const latestDataPoint = data.dataPoints[data.dataPoints.length - 1];
  const value = latestDataPoint?.value ?? 0;

  // Display value as percentage (assuming value is already in percentage format 0-100)
  const achievementRate = value;
  const displayValue = Math.min(Math.max(achievementRate, 0), 100); // Clamp to 0-100

  // Determine gauge style
  const isHalfCircle = displayConfig.style === 'half';
  const startAngle = isHalfCircle ? 180 : 0;
  const endAngle = isHalfCircle ? 360 : 360;

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <CircularGaugeComponent
        id={`gauge-${widget.id}`}
        height={isHalfCircle ? '200px' : '250px'}
        width="100%"
        background="transparent"
      >
        <Inject services={[Annotations]} />
        <AxesDirective>
          <AxisDirective
            minimum={0}
            maximum={100}
            startAngle={startAngle}
            endAngle={endAngle}
            radius="80%"
            lineStyle={{ width: 0 }}
            labelStyle={{
              font: { size: '0px' },
            }}
            majorTicks={{
              height: 0,
            }}
            minorTicks={{
              height: 0,
            }}
          >
            <RangesDirective>
              {/* Low range (0-60): Red */}
              <RangeDirective
                start={0}
                end={60}
                startWidth={15}
                endWidth={15}
                color="#ef4444"
                radius="100%"
              />
              {/* Medium range (60-80): Amber */}
              <RangeDirective
                start={60}
                end={80}
                startWidth={15}
                endWidth={15}
                color="#f59e0b"
                radius="100%"
              />
              {/* High range (80-100): Green */}
              <RangeDirective
                start={80}
                end={100}
                startWidth={15}
                endWidth={15}
                color="#10b981"
                radius="100%"
              />
            </RangesDirective>
            <PointersDirective>
              <PointerDirective
                value={displayValue}
                radius="70%"
                pointerWidth={8}
                color="#374151"
                cap={{
                  radius: 8,
                  color: '#374151',
                }}
                needleTail={{
                  length: '15%',
                }}
              />
            </PointersDirective>
          </AxisDirective>
        </AxesDirective>
      </CircularGaugeComponent>

      {/* Value display */}
      <div className="mt-4 text-center">
        <div className="text-3xl font-bold text-neutral-900">
          {achievementRate.toFixed(1)}%
        </div>
        <div className="text-sm text-neutral-600 mt-1">達成率</div>
        <div className="text-lg font-semibold text-neutral-700 mt-2">
          {value.toLocaleString('ja-JP')} {data.unit || ''}
        </div>
      </div>
    </div>
  );
}
