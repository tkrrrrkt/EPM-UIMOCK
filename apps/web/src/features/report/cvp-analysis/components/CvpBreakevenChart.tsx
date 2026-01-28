'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui';
import { AlertCircle } from 'lucide-react';
import type { BffCvpBreakevenChartData } from '../types';
import { formatCurrency } from '../lib/cvp-calculator';

interface CvpBreakevenChartProps {
  data: BffCvpBreakevenChartData | undefined;
}

const chartConfig = {
  sales: {
    label: '売上高',
    color: 'var(--chart-1)',
  },
  totalCost: {
    label: '総費用',
    color: 'var(--chart-2)',
  },
  fixedCost: {
    label: '固定費',
    color: 'var(--chart-4)',
  },
};

export function CvpBreakevenChart({ data }: CvpBreakevenChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">損益分岐チャート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            データを読み込み中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.isCalculable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">損益分岐チャート</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              損益分岐点を計算できません（売上高または限界利益率が0です）
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Combine data for chart
  const chartData = data.salesLine.map((point, index) => ({
    x: point.x,
    sales: point.y,
    totalCost: data.totalCostLine[index]?.y ?? 0,
    fixedCost: data.fixedCostLine[0]?.y ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">損益分岐チャート</CardTitle>
        {data.breakevenPoint && (
          <p className="text-sm text-muted-foreground">
            損益分岐点: {formatCurrency(data.breakevenPoint.x)}円
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="x"
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      sales: '売上高',
                      totalCost: '総費用',
                      fixedCost: '固定費',
                    };
                    return (
                      <span>
                        {labels[name as string] || name}: {formatCurrency(value as number)}円
                      </span>
                    );
                  }}
                />
              }
            />
            <Legend />
            <Line
              type="linear"
              dataKey="sales"
              name="売上高"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="totalCost"
              name="総費用"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="fixedCost"
              name="固定費"
              stroke="var(--chart-4)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            {data.breakevenPoint && (
              <ReferenceDot
                x={data.breakevenPoint.x}
                y={data.breakevenPoint.y}
                r={6}
                fill="var(--destructive)"
                stroke="var(--background)"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
