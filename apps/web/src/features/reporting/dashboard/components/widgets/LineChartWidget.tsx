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

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  Legend,
  Tooltip,
  Category,
} from '@syncfusion/ej2-react-charts';
import type { BffWidgetDto, BffWidgetDataResponseDto, LineChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface LineChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Line Chart Widget Component
 * Displays time series data as line chart with SyncFusion Charts
 */
export function LineChartWidget({ widget, data }: LineChartWidgetProps) {
  const displayConfig = widget.displayConfig as LineChartDisplayConfig;

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
        y: dp.compareValue ?? null,
      }))
    : [];

  return (
    <div className="h-full flex flex-col">
      <ChartComponent
        id={`line-chart-${widget.id}`}
        height="100%"
        primaryXAxis={{
          valueType: 'Category',
          edgeLabelPlacement: 'Shift',
        }}
        primaryYAxis={{
          labelFormat: data.unit ? `{value}${data.unit}` : '{value}',
        }}
        tooltip={{
          enable: displayConfig.showDataLabels ?? true,
          shared: true,
          format: data.unit ? '${point.x} : <b>${point.y}' + data.unit + '</b>' : '${point.x} : <b>${point.y}</b>',
        }}
        legendSettings={{
          visible: displayConfig.showLegend ?? true,
          position: 'Bottom',
        }}
        background="transparent"
      >
        <Inject services={[LineSeries, Legend, Tooltip, Category]} />
        <SeriesCollectionDirective>
          {/* Primary Series */}
          <SeriesDirective
            dataSource={primarySeriesData}
            xName="x"
            yName="y"
            name={data.meta?.sourceName || 'Primary'}
            type="Line"
            width={2}
            marker={{
              visible: displayConfig.showDataLabels ?? false,
              width: 6,
              height: 6,
            }}
            fill="#3b82f6"
          />

          {/* Compare Series */}
          {hasCompareData && (
            <SeriesDirective
              dataSource={compareSeriesData}
              xName="x"
              yName="y"
              name="Compare"
              type="Line"
              width={2}
              dashArray="5,5"
              marker={{
                visible: displayConfig.showDataLabels ?? false,
                width: 6,
                height: 6,
              }}
              fill="#f59e0b"
            />
          )}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}
