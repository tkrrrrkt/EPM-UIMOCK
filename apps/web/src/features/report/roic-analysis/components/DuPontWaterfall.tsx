'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import type { BffRoicKpiItem } from '../types';

interface DuPontWaterfallProps {
  kpis: BffRoicKpiItem[];
  waccRate: number | null;
}

interface WaterfallDataPoint {
  name: string;
  value: number;
  displayValue: number;
  start: number;
  fill: string;
  isTotal?: boolean;
  label: string;
}

export function DuPontWaterfall({ kpis, waccRate }: DuPontWaterfallProps) {
  // KPIからデータ抽出
  const getKpiValue = (id: string): number => {
    const kpi = kpis.find((k) => k.id === id);
    return kpi?.originalValue ?? 0;
  };

  const roic = getKpiValue('roic') * 100;
  const nopatMargin = getKpiValue('nopatMargin') * 100;
  const assetTurnover = getKpiValue('investedCapitalTurnover');
  const taxRate = getKpiValue('effectiveTaxRate') * 100;
  const wacc = (waccRate ?? 0) * 100;

  // DuPont分解の流れを構築
  // 売上高 → 営業利益率 → 税引後 → NOPAT率 → 資本回転率乗算 → ROIC
  const operatingMargin = getKpiValue('operatingMargin') * 100;

  // ウォーターフォールデータ
  const data: WaterfallDataPoint[] = [
    {
      name: '営業利益率',
      value: operatingMargin,
      displayValue: operatingMargin,
      start: 0,
      fill: 'hsl(var(--chart-1))',
      label: `${operatingMargin.toFixed(1)}%`,
    },
    {
      name: '税効果',
      value: -(operatingMargin - nopatMargin),
      displayValue: operatingMargin - nopatMargin,
      start: operatingMargin,
      fill: 'hsl(var(--destructive))',
      label: `-${(operatingMargin - nopatMargin).toFixed(1)}%`,
    },
    {
      name: 'NOPAT率',
      value: nopatMargin,
      displayValue: nopatMargin,
      start: 0,
      fill: 'hsl(var(--chart-2))',
      isTotal: true,
      label: `${nopatMargin.toFixed(1)}%`,
    },
    {
      name: '資本回転率効果',
      value: roic - nopatMargin,
      displayValue: Math.abs(roic - nopatMargin),
      start: nopatMargin,
      fill: roic > nopatMargin ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))',
      label: `×${assetTurnover.toFixed(2)}回`,
    },
    {
      name: 'ROIC',
      value: roic,
      displayValue: roic,
      start: 0,
      fill: roic > wacc ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))',
      isTotal: true,
      label: `${roic.toFixed(1)}%`,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">DuPont分析</CardTitle>
        <p className="text-xs text-muted-foreground">
          ROIC = NOPAT率 × 投下資本回転率 | NOPAT率 = 営業利益率 × (1 - 実効税率)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 80, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 'auto']}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip
                formatter={(value, name, props) => {
                  const point = props.payload as WaterfallDataPoint;
                  return [point.label, point.name];
                }}
                labelFormatter={() => ''}
              />
              {waccRate !== null && (
                <ReferenceLine
                  x={wacc}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  label={{
                    value: `WACC ${wacc.toFixed(1)}%`,
                    position: 'top',
                    fill: 'hsl(var(--destructive))',
                    fontSize: 11,
                  }}
                />
              )}
              <Bar dataKey="displayValue" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 分解式の表示 */}
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">ROIC</span>
              <span className="text-lg font-bold" style={{ color: roic > wacc ? 'hsl(var(--chart-3))' : 'hsl(var(--destructive))' }}>
                {roic.toFixed(2)}%
              </span>
            </div>
            <span className="text-muted-foreground">=</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">NOPAT率</span>
              <span className="font-bold">{nopatMargin.toFixed(2)}%</span>
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">回転率</span>
              <span className="font-bold">{assetTurnover.toFixed(2)}回</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>営業利益率 {operatingMargin.toFixed(1)}%</span>
            <span>×</span>
            <span>(1 - 税率 {taxRate.toFixed(1)}%)</span>
            <span>=</span>
            <span>NOPAT率 {nopatMargin.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
