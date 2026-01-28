'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicKpiItem, SimulatedValues } from '../types';
import { formatKpiValue } from '../lib/roic-calculator';

interface RoicKpiCardsProps {
  kpis: BffRoicKpiItem[];
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
}

function getChangeIndicator(
  original: number | null,
  simulated: number | null
): 'up' | 'down' | 'neutral' {
  if (original === null || simulated === null) return 'neutral';
  if (simulated > original) return 'up';
  if (simulated < original) return 'down';
  return 'neutral';
}

function KpiCard({
  kpi,
  isSimulated,
  compareEnabled,
  tier,
}: {
  kpi: BffRoicKpiItem;
  isSimulated: boolean;
  compareEnabled: boolean;
  tier: number;
}) {
  const displayValue = isSimulated ? kpi.simulatedValue : kpi.originalValue;
  const formattedValue = formatKpiValue(displayValue, kpi.format, kpi.unit);
  const changeIndicator = getChangeIndicator(
    kpi.originalValue,
    kpi.simulatedValue
  );

  // ROICスプレッドの場合、正負で色分け
  const isRoicSpread = kpi.id === 'roicSpread';
  const isPositiveSpread = isRoicSpread && (displayValue ?? 0) > 0;
  const isNegativeSpread = isRoicSpread && (displayValue ?? 0) < 0;

  // Compare値の表示
  const compareFormatted = compareEnabled && kpi.compareValue !== null
    ? formatKpiValue(kpi.compareValue, kpi.format, kpi.unit)
    : null;

  return (
    <Card
      className={cn(
        'transition-all',
        tier === 1 && 'border-primary/30',
        tier === 3 && 'opacity-80',
        isSimulated && changeIndicator !== 'neutral' && 'ring-2 ring-primary/20'
      )}
    >
      <CardHeader
        className={cn(
          'pb-2',
          tier === 1 && 'pt-4',
          tier === 2 && 'pt-3',
          tier === 3 && 'pt-2'
        )}
      >
        <CardTitle
          className={cn(
            'flex items-center justify-between text-muted-foreground',
            tier === 1 && 'text-sm',
            tier === 2 && 'text-xs',
            tier === 3 && 'text-xs'
          )}
        >
          <span>{kpi.name}</span>
          {isSimulated && changeIndicator === 'up' && (
            <TrendingUp className="h-4 w-4 text-chart-3" />
          )}
          {isSimulated && changeIndicator === 'down' && (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          tier === 1 && 'pb-4',
          tier === 2 && 'pb-3',
          tier === 3 && 'pb-2'
        )}
      >
        <div
          className={cn(
            'font-bold tabular-nums',
            tier === 1 && 'text-2xl',
            tier === 2 && 'text-xl',
            tier === 3 && 'text-lg',
            isPositiveSpread && 'text-chart-3',
            isNegativeSpread && 'text-destructive'
          )}
        >
          {formattedValue}
        </div>
        {compareFormatted && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="h-3 w-3" />
            <span>比較: {compareFormatted}</span>
          </div>
        )}
        {isSimulated && kpi.originalValue !== kpi.simulatedValue && (
          <div className="mt-1 text-xs text-muted-foreground">
            元値: {formatKpiValue(kpi.originalValue, kpi.format, kpi.unit)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RoicKpiCards({
  kpis,
  simulatedValues,
  compareEnabled,
}: RoicKpiCardsProps) {
  const hasSimulation = Object.keys(simulatedValues).length > 0;

  // Tier分け
  const tier1 = kpis.filter((k) => k.displayPriority === 1);
  const tier2 = kpis.filter((k) => k.displayPriority === 2);
  const tier3 = kpis.filter((k) => k.displayPriority === 3);

  return (
    <div className="space-y-4">
      {/* Tier 1: 最重要指標 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tier1.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            isSimulated={hasSimulation}
            compareEnabled={compareEnabled}
            tier={1}
          />
        ))}
      </div>

      {/* Tier 2: 重要指標 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tier2.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            isSimulated={hasSimulation}
            compareEnabled={compareEnabled}
            tier={2}
          />
        ))}
      </div>

      {/* Tier 3: 補足指標 */}
      <div className="grid grid-cols-3 gap-2">
        {tier3.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            isSimulated={hasSimulation}
            compareEnabled={compareEnabled}
            tier={3}
          />
        ))}
      </div>
    </div>
  );
}
