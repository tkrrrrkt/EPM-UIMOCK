'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import type { BffRoicDecompositionChartData } from '../types';

interface RoicDecompositionBarProps {
  chartData: BffRoicDecompositionChartData;
  compareEnabled: boolean;
  hasSimulation: boolean;
}

export function RoicDecompositionBar({
  chartData,
  compareEnabled,
  hasSimulation,
}: RoicDecompositionBarProps) {
  const { original, simulated, compare } = chartData;

  // データ準備
  const data = [];

  // 元値
  data.push({
    name: '元値',
    nopatRate: (original.nopatRate ?? 0) * 100,
    capitalTurnover: original.capitalTurnover ?? 0,
    roic: (original.roic ?? 0) * 100,
    type: 'original',
  });

  // シミュレーション後（変更がある場合のみ）
  if (hasSimulation) {
    data.push({
      name: 'シミュ後',
      nopatRate: (simulated.nopatRate ?? 0) * 100,
      capitalTurnover: simulated.capitalTurnover ?? 0,
      roic: (simulated.roic ?? 0) * 100,
      type: 'simulated',
    });
  }

  // 比較値
  if (compareEnabled && compare) {
    data.push({
      name: '比較',
      nopatRate: (compare.nopatRate ?? 0) * 100,
      capitalTurnover: compare.capitalTurnover ?? 0,
      roic: (compare.roic ?? 0) * 100,
      type: 'compare',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROIC分解</CardTitle>
        <p className="text-xs text-muted-foreground">
          ROIC = NOPAT率 × 資本回転率
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barGap={8}>
              <CartesianGrid strokeDasharray="3 3" horizontal />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip
                formatter={(value, name) => {
                  const numValue = Number(value);
                  if (name === 'nopatRate' || name === 'roic') {
                    return [`${numValue.toFixed(2)}%`, name === 'nopatRate' ? 'NOPAT率' : 'ROIC'];
                  }
                  return [`${numValue.toFixed(2)}回`, '資本回転率'];
                }}
              />
              <Legend
                formatter={(value) => {
                  switch (value) {
                    case 'nopatRate':
                      return 'NOPAT率 (%)';
                    case 'capitalTurnover':
                      return '資本回転率 (回)';
                    case 'roic':
                      return 'ROIC (%)';
                    default:
                      return value;
                  }
                }}
              />
              <Bar dataKey="nopatRate" name="nopatRate" fill="var(--color-chart-1)" />
              <Bar dataKey="capitalTurnover" name="capitalTurnover" fill="var(--color-chart-4)" />
              <Bar dataKey="roic" name="roic" fill="var(--color-chart-3)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 計算式表示 */}
        <div className="mt-4 grid gap-2">
          {data.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="font-medium">{d.name}</span>
              <span className="font-mono">
                {d.nopatRate.toFixed(2)}% × {d.capitalTurnover.toFixed(2)}回 ={' '}
                <span className="font-bold text-primary">
                  {d.roic.toFixed(2)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
