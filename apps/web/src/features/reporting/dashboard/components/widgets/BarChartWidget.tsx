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

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  ColumnSeries,
  BarSeries,
  Category,
  Legend,
  Tooltip,
  DataLabel,
  StackingColumnSeries,
  StackingBarSeries,
} from '@syncfusion/ej2-react-charts';
import type { BffWidgetDto, BffWidgetDataResponseDto, BarChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface BarChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Bar Chart Widget Component
 * Displays categorical data as bar/column chart with SyncFusion Charts
 */
export function BarChartWidget({ widget, data }: BarChartWidgetProps) {
  const displayConfig = widget.displayConfig as BarChartDisplayConfig;
  const isHorizontal = displayConfig.orientation === 'horizontal';
  const isStacked = displayConfig.stacked ?? false;

  // Prepare primary series data
  const primarySeriesData = data.dataPoints.map(dp => ({
    x: dp.label,
    y: dp.value,
  }));

  // Prepare compare series data if exists
  const hasCompareData = data.dataPoints.some(dp => dp.compareValue !== null && dp.compareValue !== undefined);
  const compareSeriesData = hasCompareData
    ? data.dataPoints.map(dp => ({
        x: dp.label,
        y: dp.compareValue ?? 0,
      }))
    : [];

  // Determine series type based on orientation and stacking
  let seriesType: 'Column' | 'Bar' | 'StackingColumn' | 'StackingBar';
  if (isStacked) {
    seriesType = isHorizontal ? 'StackingBar' : 'StackingColumn';
  } else {
    seriesType = isHorizontal ? 'Bar' : 'Column';
  }

  // Inject required services
  const services = [
    Category,
    Legend,
    Tooltip,
    DataLabel,
    ...(isStacked
      ? [StackingColumnSeries, StackingBarSeries]
      : [ColumnSeries, BarSeries]),
  ];

  return (
    <div className="h-full flex flex-col">
      <ChartComponent
        id={`bar-chart-${widget.id}`}
        height="100%"
        primaryXAxis={{
          valueType: 'Category',
          majorGridLines: { width: 0 },
        }}
        primaryYAxis={{
          labelFormat: data.unit ? `{value}${data.unit}` : '{value}',
          majorTickLines: { width: 0 },
          lineStyle: { width: 0 },
        }}
        tooltip={{
          enable: displayConfig.showDataLabels ?? true,
          format: data.unit ? '${point.x} : <b>${point.y}' + data.unit + '</b>' : '${point.x} : <b>${point.y}</b>',
        }}
        legendSettings={{
          visible: displayConfig.showLegend ?? true,
          position: 'Bottom',
        }}
        background="transparent"
      >
        <Inject services={services} />
        <SeriesCollectionDirective>
          {/* Primary Series */}
          <SeriesDirective
            dataSource={primarySeriesData}
            xName="x"
            yName="y"
            name={data.meta?.sourceName || 'Primary'}
            type={seriesType}
            columnWidth={0.6}
            fill="#3b82f6"
          />

          {/* Compare Series */}
          {hasCompareData && (
            <SeriesDirective
              dataSource={compareSeriesData}
              xName="x"
              yName="y"
              name="Compare"
              type={seriesType}
              columnWidth={0.6}
              fill="#f59e0b"
            />
          )}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}
