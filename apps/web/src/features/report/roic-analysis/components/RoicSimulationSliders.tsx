'use client';

import { useCallback, useMemo } from 'react';
import { RotateCcw, Target, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Slider,
  Label,
  Badge,
} from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicKpiItem, BffRoicTreeLine, SimulatedValues } from '../types';
import { RoicTreeSection } from '../types';
import { formatCurrency } from '../lib/roic-calculator';

interface RoicSimulationSlidersProps {
  kpis: BffRoicKpiItem[];
  tree: BffRoicTreeLine[];
  waccRate: number | null;
  simulatedValues: SimulatedValues;
  onValueChange: (lineId: string, value: number) => void;
  onReset: () => void;
}

interface SimulationDriver {
  id: string;
  name: string;
  lineId: string;
  originalValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'cost' | 'asset' | 'liability';
}

export function RoicSimulationSliders({
  kpis,
  tree,
  waccRate,
  simulatedValues,
  onValueChange,
  onReset,
}: RoicSimulationSlidersProps) {
  // KPI値を取得
  const getKpiValue = (id: string, simulated = false): number => {
    const kpi = kpis.find((k) => k.id === id);
    if (!kpi) return 0;
    return simulated ? (kpi.simulatedValue ?? kpi.originalValue ?? 0) : (kpi.originalValue ?? 0);
  };

  const currentRoic = getKpiValue('roic', true) * 100;
  const originalRoic = getKpiValue('roic', false) * 100;
  const wacc = waccRate !== null ? waccRate * 100 : null;

  // シミュレーション対象のドライバーを抽出
  const drivers = useMemo((): SimulationDriver[] => {
    const editableLines = tree.filter((line) => line.isEditable);

    return editableLines.slice(0, 8).map((line) => {
      const value = line.originalValue ?? 0;
      const isNopat = line.section === RoicTreeSection.NOPAT;
      const isInvestedCapital = line.section === RoicTreeSection.INVESTED_CAPITAL;
      const isLiability = isInvestedCapital && (line.rollupCoefficient ?? 1) < 0;
      const isAsset = isInvestedCapital && !isLiability;
      const isProfit = isNopat && (line.originalValue ?? 0) >= 0;

      // 変動幅を設定（±30%）
      const variance = Math.abs(value) * 0.3;

      return {
        id: line.lineId,
        name: line.displayName,
        lineId: line.lineId,
        originalValue: value,
        unit: '百万円',
        min: value - variance,
        max: value + variance,
        step: Math.max(1, Math.abs(value) / 100),
        impact: Math.abs(value) > 1000 ? 'high' : Math.abs(value) > 100 ? 'medium' : 'low',
        category: isNopat ? (isProfit ? 'revenue' : 'cost') : isAsset ? 'asset' : isLiability ? 'liability' : 'cost',
      };
    });
  }, [tree]);

  const handleSliderChange = useCallback(
    (lineId: string, values: number[]) => {
      onValueChange(lineId, values[0]);
    },
    [onValueChange]
  );

  const getValue = (lineId: string, originalValue: number): number => {
    return simulatedValues[lineId] ?? originalValue;
  };

  const getChangePercent = (lineId: string, originalValue: number): number => {
    const current = getValue(lineId, originalValue);
    if (originalValue === 0) return 0;
    return ((current - originalValue) / Math.abs(originalValue)) * 100;
  };

  const hasChanges = Object.keys(simulatedValues).length > 0;
  const roicChange = currentRoic - originalRoic;
  const roicAboveWacc = wacc !== null ? currentRoic > wacc : null;
  const roicSpread = wacc !== null ? currentRoic - wacc : null;

  // 感度分析：各ドライバーの1%変化がROICに与える影響を推定
  const sensitivityAnalysis = useMemo(() => {
    return drivers.map((driver) => {
      // 簡易的な感度計算（実際はより複雑な計算が必要）
      const impact = driver.category === 'revenue'
        ? 0.05
        : driver.category === 'cost'
        ? -0.03
        : driver.category === 'asset'
        ? -0.02
        : 0.01;

      return {
        ...driver,
        sensitivity: impact,
      };
    }).sort((a, b) => Math.abs(b.sensitivity) - Math.abs(a.sensitivity));
  }, [drivers]);

  return (
    <div className="space-y-6">
      {/* ROICターゲットカード */}
      <Card
        className={cn(
          'border-2',
          roicAboveWacc === null
            ? 'border-muted/40 bg-muted/20'
            : roicAboveWacc
            ? 'border-chart-3/30 bg-chart-3/5'
            : 'border-destructive/30 bg-destructive/5'
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">シミュレーション後 ROIC</p>
              <div className="flex items-baseline gap-3">
                <span className={cn(
                  'text-4xl font-bold tabular-nums',
                  roicAboveWacc === null
                    ? 'text-foreground'
                    : roicAboveWacc
                    ? 'text-chart-3'
                    : 'text-destructive'
                )}>
                  {currentRoic.toFixed(2)}%
                </span>
                {hasChanges && (
                  <Badge variant={roicChange >= 0 ? 'default' : 'destructive'} className="text-xs">
                    {roicChange >= 0 ? '+' : ''}{roicChange.toFixed(2)}%
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                WACC: {wacc !== null ? `${wacc.toFixed(2)}%` : '未設定'} | スプレッド: {roicSpread !== null ? `${roicSpread >= 0 ? '+' : ''}${roicSpread.toFixed(2)}%` : '—'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {roicAboveWacc === null ? (
                <Badge variant="secondary" className="text-xs">
                  判定保留
                </Badge>
              ) : roicAboveWacc ? (
                <div className="flex items-center gap-2 text-chart-3">
                  <TrendingUp className="h-8 w-8" />
                  <span className="text-sm font-medium">価値創造中</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-8 w-8" />
                  <span className="text-sm font-medium">要改善</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={!hasChanges}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                リセット
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* シミュレーションスライダー */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            ドライバー調整
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            スライダーを動かしてROICへの影響をシミュレーション
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {drivers.map((driver) => {
              const currentValue = getValue(driver.lineId, driver.originalValue);
              const changePercent = getChangePercent(driver.lineId, driver.originalValue);
              const isChanged = Math.abs(changePercent) > 0.1;

              return (
                <div
                  key={driver.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    isChanged && 'border-primary/30 bg-primary/5'
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{driver.name}</Label>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          driver.impact === 'high' && 'border-chart-1 text-chart-1',
                          driver.impact === 'medium' && 'border-chart-2 text-chart-2',
                          driver.impact === 'low' && 'border-muted-foreground'
                        )}
                      >
                        {driver.impact === 'high' ? '高影響' : driver.impact === 'medium' ? '中影響' : '低影響'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">
                        {formatCurrency(currentValue)}
                      </div>
                      {isChanged && (
                        <div className={cn(
                          'text-xs',
                          changePercent >= 0 ? 'text-chart-3' : 'text-destructive'
                        )}>
                          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <Slider
                    value={[currentValue]}
                    min={driver.min}
                    max={driver.max}
                    step={driver.step}
                    onValueChange={(values) => handleSliderChange(driver.lineId, values)}
                    className="py-2"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(driver.min)}</span>
                    <span className="text-center">元値: {formatCurrency(driver.originalValue)}</span>
                    <span>{formatCurrency(driver.max)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 感度分析 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">感度分析</CardTitle>
          <p className="text-xs text-muted-foreground">
            各ドライバーの変化がROICに与える影響度
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sensitivityAnalysis.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2"
              >
                <span className="w-6 text-center font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="w-24">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${Math.abs(item.sensitivity) * 200}%`,
                      backgroundColor: item.sensitivity >= 0
                        ? 'hsl(var(--chart-3))'
                        : 'hsl(var(--destructive))',
                    }}
                  />
                </div>
                <span className={cn(
                  'w-16 text-right text-xs font-mono',
                  item.sensitivity >= 0 ? 'text-chart-3' : 'text-destructive'
                )}>
                  {item.sensitivity >= 0 ? '+' : ''}{(item.sensitivity * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
