'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import type { BffRoicVsWaccChartData } from '../types';

interface RoicVsWaccChartProps {
  chartData: BffRoicVsWaccChartData;
  compareEnabled: boolean;
  hasSimulation: boolean;
}

export function RoicVsWaccChart({
  chartData,
  compareEnabled,
  hasSimulation,
}: RoicVsWaccChartProps) {
  const { points, isSinglePoint, waccRate } = chartData;

  // 単一期間の場合はバレットチャート
  if (isSinglePoint && points.length > 0) {
    const point = points[0];
    const roicValue = hasSimulation
      ? point.roicSimulated
      : point.roicOriginal;
    const isAboveWacc =
      roicValue !== null && waccRate !== null && roicValue > waccRate;

    const barData = [
      {
        name: 'ROIC',
        value: roicValue !== null ? roicValue * 100 : 0,
        wacc: waccRate !== null ? waccRate * 100 : 0,
      },
    ];

    if (compareEnabled && point.roicCompare !== null) {
      barData.push({
        name: '比較',
        value: point.roicCompare * 100,
        wacc: waccRate !== null ? waccRate * 100 : 0,
      });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ROIC vs WACC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal />
                <XAxis
                  type="number"
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}%`]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value > entry.wacc
                          ? 'var(--color-chart-3)'
                          : 'var(--color-destructive)'
                      }
                    />
                  ))}
                </Bar>
                {waccRate !== null && (
                  <ReferenceLine
                    x={waccRate * 100}
                    stroke="var(--color-destructive)"
                    strokeDasharray="5 5"
                    label={{
                      value: `WACC ${(waccRate * 100).toFixed(1)}%`,
                      position: 'top',
                      fill: 'var(--color-destructive)',
                      fontSize: 12,
                    }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm">
            <span
              className={
                isAboveWacc ? 'text-chart-3' : 'text-destructive'
              }
            >
              {isAboveWacc ? '良好（ROIC > WACC）' : '要改善（ROIC < WACC）'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 複数期間の場合は折れ線グラフ
  const lineData = points.map((p) => ({
    period: p.label,
    roicOriginal: p.roicOriginal !== null ? p.roicOriginal * 100 : null,
    roicSimulated: p.roicSimulated !== null ? p.roicSimulated * 100 : null,
    roicCompare: p.roicCompare !== null ? p.roicCompare * 100 : null,
    wacc: p.wacc !== null ? p.wacc * 100 : null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ROIC vs WACC 推移</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`]}
              />
              <Legend />

              {/* WACC基準線 */}
              {waccRate !== null && (
                <ReferenceLine
                  y={waccRate * 100}
                  stroke="var(--color-destructive)"
                  strokeDasharray="5 5"
                  label={{
                    value: 'WACC',
                    position: 'right',
                    fill: 'var(--color-destructive)',
                  }}
                />
              )}

              {/* ROICシミュレーション後（太線） */}
              {hasSimulation && (
                <Line
                  type="monotone"
                  dataKey="roicSimulated"
                  name="ROIC (シミュ後)"
                  stroke="var(--color-chart-1)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* ROIC元値（細線/透明） */}
              <Line
                type="monotone"
                dataKey="roicOriginal"
                name={hasSimulation ? 'ROIC (元値)' : 'ROIC'}
                stroke="var(--color-chart-1)"
                strokeWidth={hasSimulation ? 1.5 : 3}
                strokeOpacity={hasSimulation ? 0.5 : 1}
                dot={{ r: hasSimulation ? 2 : 4 }}
              />

              {/* Compare（点線） */}
              {compareEnabled && (
                <Line
                  type="monotone"
                  dataKey="roicCompare"
                  name="ROIC (比較)"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
