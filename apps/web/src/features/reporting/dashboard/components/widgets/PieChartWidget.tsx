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

import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  AccumulationLegend,
  PieSeries,
  AccumulationTooltip,
  AccumulationDataLabel,
} from '@syncfusion/ej2-react-charts';
import type { BffWidgetDto, BffWidgetDataResponseDto, PieChartDisplayConfig } from '@epm/contracts/bff/dashboard';

interface PieChartWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Pie Chart Widget Component
 * Displays composition ratio as pie/donut chart with SyncFusion AccumulationChart
 */
export function PieChartWidget({ widget, data }: PieChartWidgetProps) {
  const displayConfig = widget.displayConfig as PieChartDisplayConfig;

  // Prepare data for pie chart
  const pieData = data.dataPoints.map(dp => ({
    x: dp.label,
    y: dp.value ?? 0,
  }));

  return (
    <div className="h-full flex flex-col">
      <AccumulationChartComponent
        id={`pie-chart-${widget.id}`}
        height="100%"
        legendSettings={{
          visible: displayConfig.showLegend ?? true,
          position: 'Bottom',
        }}
        tooltip={{
          enable: displayConfig.showLabels ?? true,
          format: data.unit ? '${point.x} : <b>${point.y}' + data.unit + ' (${point.percentage}%)</b>' : '${point.x} : <b>${point.y} (${point.percentage}%)</b>',
        }}
        background="transparent"
      >
        <Inject services={[AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel]} />
        <AccumulationSeriesCollectionDirective>
          <AccumulationSeriesDirective
            dataSource={pieData}
            xName="x"
            yName="y"
            type="Pie"
            innerRadius={displayConfig.donut ? '40%' : '0%'}
            dataLabel={{
              visible: displayConfig.showLabels ?? true,
              name: 'x',
              position: 'Outside',
              template: '<div>${point.x}: ${point.y}</div>',
            }}
            palettes={[
              '#3b82f6', // blue
              '#f59e0b', // amber
              '#10b981', // green
              '#ef4444', // red
              '#8b5cf6', // purple
              '#ec4899', // pink
              '#14b8a6', // teal
              '#f97316', // orange
            ]}
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
}
