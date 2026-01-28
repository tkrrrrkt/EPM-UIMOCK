'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicTreeLine, SimulatedValues } from '../types';
import { RoicTreeSection } from '../types';
import { formatCurrency } from '../lib/roic-calculator';

interface RoicAmountBreakdownProps {
  tree: BffRoicTreeLine[];
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
}

interface BreakdownSection {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  lines: BffRoicTreeLine[];
  total: number;
  simulatedTotal: number;
}

function BreakdownItem({
  line,
  simulatedValues,
  compareEnabled,
  maxValue,
}: {
  line: BffRoicTreeLine;
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
  maxValue: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = line.childLineIds.length > 0;

  const originalValue = line.originalValue ?? 0;
  const simulatedValue = simulatedValues[line.lineId] ?? originalValue;
  const compareValue = line.compareValue ?? null;

  const change = simulatedValue - originalValue;
  const changePercent = originalValue !== 0 ? (change / Math.abs(originalValue)) * 100 : 0;
  const isChanged = Math.abs(changePercent) > 0.1;

  const progressValue = maxValue > 0 ? (Math.abs(simulatedValue) / maxValue) * 100 : 0;

  return (
    <div
      className={cn(
        'border-b border-border/50 last:border-0',
        isChanged && 'bg-primary/5'
      )}
      style={{ paddingLeft: `${line.indentLevel * 16}px` }}
    >
      <div className="flex items-center gap-2 py-2 pr-4">
        {/* 展開ボタン */}
        <button
          type="button"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* 項目名 */}
        <div className="flex-1 min-w-0">
          <span className={cn(
            'text-sm truncate',
            line.lineType === 'header' && 'font-semibold',
            line.lineType === 'note' && 'text-muted-foreground italic'
          )}>
            {line.displayName}
          </span>
        </div>

        {/* プログレスバー */}
        <div className="w-32 hidden lg:block">
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* シミュレーション値 */}
        <div className="w-28 text-right">
          <div className="font-mono text-sm font-medium">
            {formatCurrency(simulatedValue)}
          </div>
          {isChanged && (
            <div className={cn(
              'flex items-center justify-end gap-1 text-xs',
              change >= 0 ? 'text-chart-3' : 'text-destructive'
            )}>
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* 元値 */}
        <div className="w-24 text-right text-sm text-muted-foreground hidden md:block">
          {formatCurrency(originalValue)}
        </div>

        {/* 比較値 */}
        {compareEnabled && (
          <div className="w-24 text-right text-sm text-muted-foreground hidden xl:block">
            {compareValue !== null ? formatCurrency(compareValue) : '-'}
          </div>
        )}
      </div>
    </div>
  );
}

export function RoicAmountBreakdown({
  tree,
  simulatedValues,
  compareEnabled,
}: RoicAmountBreakdownProps) {
  // セクション別にグループ化
  const sectionDefinitions: Omit<BreakdownSection, 'lines' | 'total' | 'simulatedTotal'>[] = [
    {
      id: RoicTreeSection.NOPAT,
      name: 'NOPAT',
      icon: '📊',
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      id: RoicTreeSection.INVESTED_CAPITAL,
      name: '投下資本',
      icon: '💰',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      id: RoicTreeSection.ROIC,
      name: 'ROIC計算',
      icon: '🎯',
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
    {
      id: RoicTreeSection.DECOMPOSITION,
      name: '分解',
      icon: '🧩',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ];

  const sections: BreakdownSection[] = sectionDefinitions.map((def) => ({
    ...def,
    lines: tree.filter((l) => l.section === def.id),
    total: 0,
    simulatedTotal: 0,
  }));

  // セクションの合計を計算
  sections.forEach((section) => {
    if (section.lines.length === 0) return;
    const minIndent = Math.min(...section.lines.map((l) => l.indentLevel));
    const rootLines = section.lines.filter((l) => l.indentLevel === minIndent);
    section.total = rootLines.reduce((sum, l) => sum + (l.originalValue ?? 0), 0);
    section.simulatedTotal = rootLines.reduce(
      (sum, l) => sum + (simulatedValues[l.lineId] ?? l.originalValue ?? 0),
      0
    );
  });

  // 最大値を計算（プログレスバー用）
  const maxValue = Math.max(
    ...tree.map((l) => Math.abs(simulatedValues[l.lineId] ?? l.originalValue ?? 0))
  );

  return (
    <div className="space-y-4">
      {sections.filter((s) => s.lines.length > 0).map((section) => (
        <Card key={section.id}>
          <CardHeader className={cn('py-3', section.bgColor)}>
            <CardTitle className={cn('flex items-center justify-between text-base', section.color)}>
              <div className="flex items-center gap-2">
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-sm">
                <div>
                  <span className="text-xs text-muted-foreground mr-2">シミュ後:</span>
                  <span className="font-bold">{formatCurrency(section.simulatedTotal)}</span>
                </div>
                {section.total !== section.simulatedTotal && (
                  <div className="text-muted-foreground">
                    <span className="text-xs mr-2">元値:</span>
                    <span>{formatCurrency(section.total)}</span>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* ヘッダー */}
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="w-5" />
              <div className="flex-1">項目</div>
              <div className="w-32 text-right hidden lg:block">構成比</div>
              <div className="w-28 text-right">シミュ後</div>
              <div className="w-24 text-right hidden md:block">元値</div>
              {compareEnabled && (
                <div className="w-24 text-right hidden xl:block">比較</div>
              )}
            </div>

            {/* 明細 */}
            <div className="max-h-80 overflow-y-auto">
              {section.lines.map((line) => (
                <BreakdownItem
                  key={line.lineId}
                  line={line}
                  simulatedValues={simulatedValues}
                  compareEnabled={compareEnabled}
                  maxValue={maxValue}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
