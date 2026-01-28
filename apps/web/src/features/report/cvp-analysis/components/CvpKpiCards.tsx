'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffCvpKpiItem } from '../types';
import { formatValue } from '../lib/cvp-calculator';

interface CvpKpiCardsProps {
  kpis: BffCvpKpiItem[];
  compareEnabled: boolean;
}

export function CvpKpiCards({ kpis, compareEnabled }: CvpKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} compareEnabled={compareEnabled} />
      ))}
    </div>
  );
}

interface KpiCardProps {
  kpi: BffCvpKpiItem;
  compareEnabled: boolean;
}

function KpiCard({ kpi, compareEnabled }: KpiCardProps) {
  const hasChanged =
    kpi.simulatedValue !== null &&
    kpi.originalValue !== null &&
    kpi.simulatedValue !== kpi.originalValue;

  const simulatedDiff =
    kpi.simulatedValue !== null && kpi.originalValue !== null
      ? kpi.simulatedValue - kpi.originalValue
      : null;

  const compareDiff =
    kpi.simulatedValue !== null && kpi.compareValue !== null
      ? kpi.simulatedValue - kpi.compareValue
      : null;

  return (
    <Card className={cn(hasChanged && 'ring-2 ring-primary/30 bg-primary/5')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Main value (simulated) */}
        <div className="text-2xl font-bold text-foreground">
          {kpi.isCalculable ? formatValue(kpi.simulatedValue, kpi.format) : '-'}
        </div>

        {/* Original vs Simulated diff */}
        {hasChanged && simulatedDiff !== null && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">元値:</span>
            <span className="text-muted-foreground">
              {formatValue(kpi.originalValue, kpi.format)}
            </span>
            <DiffIndicator value={simulatedDiff} format={kpi.format} />
          </div>
        )}

        {/* Compare diff */}
        {compareEnabled && kpi.compareValue !== null && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">比較:</span>
            <span className="text-muted-foreground">
              {formatValue(kpi.compareValue, kpi.format)}
            </span>
            {compareDiff !== null && <DiffIndicator value={compareDiff} format={kpi.format} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DiffIndicatorProps {
  value: number;
  format: 'currency' | 'percent';
}

function DiffIndicator({ value, format }: DiffIndicatorProps) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>0</span>
      </span>
    );
  }

  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-chart-3' : 'text-destructive';
  const displayValue = format === 'percent'
    ? `${(Math.abs(value) * 100).toFixed(1)}%`
    : new Intl.NumberFormat('ja-JP').format(Math.abs(value));

  return (
    <span className={cn('flex items-center gap-0.5', colorClass)}>
      <Icon className="h-3 w-3" />
      <span>{isPositive ? '+' : '-'}{displayValue}</span>
    </span>
  );
}
