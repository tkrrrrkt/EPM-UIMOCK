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

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  ColumnSeries,
  Category,
  Legend,
  Tooltip,
  DataLabel,
} from '@syncfusion/ej2-react-charts';
import type { BffWidgetDto, BffWidgetDataResponseDto, CompositeChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface CompositeChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Composite Chart Widget Component
 * Displays combined line and bar chart with dual Y-axis using SyncFusion Charts
 */
export function CompositeChartWidget({ widget, data }: CompositeChartWidgetProps) {
  const displayConfig = widget.displayConfig as CompositeChartDisplayConfig;

  // Prepare primary series data (Column/Bar)
  const primarySeriesData = data.dataPoints.map(dp => ({
    x: dp.label,
    y: dp.value,
  }));

  // Prepare compare series data if exists (Line)
  const hasCompareData = data.dataPoints.some(dp => dp.compareValue !== null && dp.compareValue !== undefined);
  const compareSeriesData = hasCompareData
    ? data.dataPoints.map(dp => ({
        x: dp.label,
        y: dp.compareValue ?? null,
      }))
    : [];

  return (
    <div className="h-full flex flex-col">
      <ChartComponent
        id={`composite-chart-${widget.id}`}
        height="100%"
        primaryXAxis={{
          valueType: 'Category',
          edgeLabelPlacement: 'Shift',
        }}
        primaryYAxis={{
          labelFormat: data.unit ? `{value}${data.unit}` : '{value}',
          title: data.meta?.sourceName || 'Primary',
          titleStyle: { color: '#3b82f6' },
          labelStyle: { color: '#3b82f6' },
        }}
        axes={hasCompareData ? [{
          name: 'secondaryYAxis',
          opposedPosition: true,
          labelFormat: '{value}',
          title: 'Compare',
          titleStyle: { color: '#f59e0b' },
          labelStyle: { color: '#f59e0b' },
        }] : []}
        tooltip={{
          enable: true,
          shared: true,
        }}
        legendSettings={{
          visible: displayConfig.showLegend ?? true,
          position: 'Bottom',
        }}
        background="transparent"
      >
        <Inject services={[LineSeries, ColumnSeries, Category, Legend, Tooltip, DataLabel]} />
        <SeriesCollectionDirective>
          {/* Primary Series - Column Chart */}
          <SeriesDirective
            dataSource={primarySeriesData}
            xName="x"
            yName="y"
            name={data.meta?.sourceName || 'Primary'}
            type="Column"
            columnWidth={0.6}
            fill="#3b82f6"
          />

          {/* Compare Series - Line Chart on secondary Y-axis */}
          {hasCompareData && (
            <SeriesDirective
              dataSource={compareSeriesData}
              xName="x"
              yName="y"
              name="Compare"
              type="Line"
              width={2}
              marker={{
                visible: true,
                width: 6,
                height: 6,
              }}
              fill="#f59e0b"
              yAxisName="secondaryYAxis"
            />
          )}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}
