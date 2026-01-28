'use client';

import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicTreeLine } from '../types';
import { RoicTreeSection } from '../types';
import { formatCurrency } from '../lib/roic-calculator';

interface RoicTreemapProps {
  tree: BffRoicTreeLine[];
}

interface TreemapDataNode {
  name: string;
  size: number;
  value: number;
  fill: string;
  children?: TreemapDataNode[];
}

type ViewType = 'investedCapital' | 'nopat';

const COLORS = {
  revenue: 'hsl(var(--chart-1))',
  cost: 'hsl(var(--chart-2))',
  asset: 'hsl(var(--chart-3))',
  liability: 'hsl(var(--chart-4))',
  profit: 'hsl(var(--chart-5))',
};

function CustomTreemapContent({
  x,
  y,
  width,
  height,
  name,
  value,
  fill,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
  fill: string;
}) {
  const showLabel = width > 60 && height > 30;
  const showValue = width > 80 && height > 45;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        rx={4}
        className="transition-opacity hover:opacity-80"
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--primary-foreground))"
          fontSize={Math.min(12, width / 8)}
          fontWeight="500"
        >
          {name.length > 10 ? `${name.slice(0, 10)}...` : name}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--primary-foreground))"
          fontSize={Math.min(10, width / 10)}
          opacity={0.9}
        >
          {formatCurrency(Math.abs(value))}
        </text>
      )}
    </g>
  );
}

export function RoicTreemap({ tree }: RoicTreemapProps) {
  const [viewType, setViewType] = useState<ViewType>('investedCapital');

  const getSectionLines = (section: BffRoicTreeLine['section']) =>
    tree.filter((line) => line.section === section);

  const getSectionChildren = (section: BffRoicTreeLine['section']) => {
    const lines = getSectionLines(section);
    if (lines.length === 0) return [];
    const minIndent = Math.min(...lines.map((line) => line.indentLevel));
    const children = lines.filter((line) => line.indentLevel > minIndent);
    return children.length > 0 ? children : lines.filter((line) => line.indentLevel === minIndent);
  };

  // 投下資本の構成（資産 - 負債）
  const buildInvestedCapitalData = (): TreemapDataNode[] => {
    const investedLines = getSectionChildren(RoicTreeSection.INVESTED_CAPITAL).filter(
      (line) => line.lineType !== 'note'
    );
    const assetLines = investedLines.filter((line) => (line.rollupCoefficient ?? 1) >= 0);
    const liabilityLines = investedLines.filter((line) => (line.rollupCoefficient ?? 1) < 0);

    const assets: TreemapDataNode = {
      name: '営業資産',
      size: 0,
      value: 0,
      fill: COLORS.asset,
      children: assetLines.map((line) => ({
        name: line.displayName,
        size: Math.abs(line.originalValue ?? 0),
        value: line.originalValue ?? 0,
        fill: 'hsl(var(--chart-3) / 0.8)',
      })),
    };
    assets.size = assets.children?.reduce((sum, c) => sum + c.size, 0) ?? 0;
    assets.value = assets.size;

    const liabilities: TreemapDataNode = {
      name: '営業負債',
      size: 0,
      value: 0,
      fill: COLORS.liability,
      children: liabilityLines.map((line) => ({
        name: line.displayName,
        size: Math.abs(line.originalValue ?? 0),
        value: line.originalValue ?? 0,
        fill: 'hsl(var(--chart-4) / 0.8)',
      })),
    };
    liabilities.size = liabilities.children?.reduce((sum, c) => sum + c.size, 0) ?? 0;
    liabilities.value = liabilities.size;

    return [assets, liabilities].filter((n) => n.size > 0);
  };

  // NOPAT構成
  const buildNopatData = (): TreemapDataNode[] => {
    const nopatLines = getSectionChildren(RoicTreeSection.NOPAT);
    return nopatLines
      .filter((line) => line.lineType !== 'note')
      .filter((line) => (line.originalValue ?? 0) !== 0)
      .map((line) => ({
        name: line.displayName,
        size: Math.abs(line.originalValue ?? 0),
        value: line.originalValue ?? 0,
        fill: (line.originalValue ?? 0) >= 0 ? COLORS.revenue : COLORS.cost,
      }));
  };

  const getData = () => {
    switch (viewType) {
      case 'investedCapital':
        return buildInvestedCapitalData();
      case 'nopat':
        return buildNopatData();
      default:
        return [];
    }
  };

  const data = getData();
  const totalValue = data.reduce((sum, d) => sum + d.size, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">構成分析（Treemap）</CardTitle>
            <p className="text-xs text-muted-foreground">
              面積は金額の大きさを表します
            </p>
          </div>
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
            <TabsList className="h-8">
              <TabsTrigger value="investedCapital" className="text-xs">
                投下資本
              </TabsTrigger>
              <TabsTrigger value="nopat" className="text-xs">
                NOPAT
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data as unknown as readonly { name: string; size: number }[]}
              dataKey="size"
              stroke="hsl(var(--background))"
              fill="hsl(var(--chart-1))"
              content={<CustomTreemapContent x={0} y={0} width={0} height={0} name="" value={0} fill="" />}
            >
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  String(name),
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* サマリー */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {data.slice(0, 4).map((item) => (
            <div
              key={item.name}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {item.name}
                </span>
              </div>
              <div className="mt-1 font-mono text-sm font-bold">
                {formatCurrency(item.size)}
              </div>
              <div className="text-xs text-muted-foreground">
                {totalValue > 0 ? ((item.size / totalValue) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
