'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui';
import type { BffCvpWaterfallData } from '../types';
import { formatCurrency } from '../lib/cvp-calculator';

interface CvpWaterfallChartProps {
  primaryData: BffCvpWaterfallData;
  compareData?: BffCvpWaterfallData | null;
  compareEnabled: boolean;
}

const chartConfig = {
  primary: {
    label: 'シミュレーション',
    color: 'var(--chart-1)',
  },
  compare: {
    label: '比較',
    color: 'var(--chart-2)',
  },
};

interface WaterfallDataPoint {
  name: string;
  start: number;
  end: number;
  value: number;
  type: string;
}

function calculateWaterfallData(data: BffCvpWaterfallData): WaterfallDataPoint[] {
  let runningTotal = 0;
  return data.items.map((item) => {
    const start = item.type === 'start' || item.type === 'subtotal' || item.type === 'end'
      ? 0
      : runningTotal;

    const value = item.type === 'subtotal' || item.type === 'end'
      ? item.value
      : Math.abs(item.value);

    const end = item.type === 'start' || item.type === 'subtotal' || item.type === 'end'
      ? item.value
      : runningTotal + item.value;

    if (item.type !== 'subtotal' && item.type !== 'end') {
      runningTotal = end;
    }

    return {
      name: item.name,
      start: Math.min(start, end),
      end: Math.max(start, end),
      value: item.value,
      type: item.type,
    };
  });
}

export function CvpWaterfallChart({ primaryData, compareData, compareEnabled }: CvpWaterfallChartProps) {
  const chartData = useMemo(() => calculateWaterfallData(primaryData), [primaryData]);

  const getBarColor = (type: string, value: number) => {
    if (type === 'start' || type === 'end') return 'var(--chart-1)';
    if (type === 'subtotal') return 'var(--chart-4)';
    return value >= 0 ? 'var(--chart-3)' : 'var(--chart-5)';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">損益構造ウォーターフォール</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="text-xs" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span>{formatCurrency(value as number)}円</span>
                  )}
                />
              }
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            {/* Invisible bar for positioning */}
            <Bar dataKey="start" stackId="stack" fill="transparent" />
            {/* Visible bar showing the value */}
            <Bar dataKey={(d: WaterfallDataPoint) => d.end - d.start} stackId="stack" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type, entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Compare waterfall (simplified as text) */}
        {compareEnabled && compareData && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">比較データ</p>
            <div className="grid grid-cols-5 gap-2 text-sm">
              {compareData.items.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="text-muted-foreground text-xs">{item.name}</div>
                  <div className="font-medium">{formatCurrency(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
