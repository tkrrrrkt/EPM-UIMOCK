'use client';

import { TrendingUp, TrendingDown, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicKpiItem } from '../types';
import { formatKpiValue } from '../lib/roic-calculator';
import { RoicKpiId } from '../types';

interface RoicExecutiveSummaryProps {
  kpis: BffRoicKpiItem[];
  waccRate: number | null;
  hasWarnings?: boolean;
  bsSubstituted?: boolean;
  compareEnabled?: boolean;
}

function getKpi(kpis: BffRoicKpiItem[], id: string) {
  return kpis.find((kpi) => kpi.id === id) ?? null;
}

function formatKpi(kpi: BffRoicKpiItem | null): string {
  if (!kpi) return '-';
  return formatKpiValue(kpi.originalValue ?? null, kpi.format, kpi.unit);
}

export function RoicExecutiveSummary({
  kpis,
  waccRate,
  hasWarnings = false,
  bsSubstituted = false,
  compareEnabled = false,
}: RoicExecutiveSummaryProps) {
  const roic = getKpi(kpis, RoicKpiId.ROIC);
  const roicSpread = getKpi(kpis, RoicKpiId.ROIC_SPREAD);
  const nopatRate = getKpi(kpis, RoicKpiId.NOPAT_RATE);
  const capitalTurnover = getKpi(kpis, RoicKpiId.CAPITAL_TURNOVER);
  const investedCapital = getKpi(kpis, RoicKpiId.INVESTED_CAPITAL);

  const roicValue = roic?.originalValue ?? 0;
  const waccValue = waccRate ?? null;
  const spreadValue =
    roicSpread?.originalValue ??
    (waccValue !== null ? roicValue - waccValue : null);
  const status =
    spreadValue === null ? 'neutral' : spreadValue > 0 ? 'positive' : spreadValue < 0 ? 'negative' : 'neutral';
  const statusLabel =
    status === 'positive' ? '価値創造' : status === 'negative' ? '改善余地あり' : '判定保留';
  const investedCapitalValue = investedCapital?.originalValue ?? null;
  const evaValue =
    spreadValue !== null && investedCapitalValue !== null
      ? spreadValue * investedCapitalValue
      : null;
  const evaTone =
    evaValue === null
      ? 'text-muted-foreground'
      : evaValue > 0
      ? 'text-chart-3'
      : evaValue < 0
      ? 'text-destructive'
      : 'text-muted-foreground';

  const getDelta = (kpi: BffRoicKpiItem | null): number | null => {
    if (!compareEnabled || !kpi || kpi.originalValue === null || kpi.compareValue === null) {
      return null;
    }
    return kpi.originalValue - kpi.compareValue;
  };

  const formatDelta = (kpi: BffRoicKpiItem | null): string | null => {
    const delta = getDelta(kpi);
    if (delta === null) return null;
    const formatted = formatKpiValue(Math.abs(delta), kpi?.format ?? 'rate', kpi?.unit ?? '');
    const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
    return `${sign}${formatted}`;
  };

  const nopatDelta = getDelta(nopatRate);
  const turnoverDelta = getDelta(capitalTurnover);

  let driverInsight =
    '収益性と資本効率の両面で改善余地を確認できます。';

  if (compareEnabled && (nopatDelta !== null || turnoverDelta !== null)) {
    if (nopatDelta !== null && turnoverDelta !== null) {
      if (Math.abs(nopatDelta) >= Math.abs(turnoverDelta)) {
        driverInsight = `主要変化は収益性の${nopatDelta >= 0 ? '改善' : '悪化'}（${formatDelta(nopatRate)}）です。`;
      } else {
        driverInsight = `主要変化は資本効率の${turnoverDelta >= 0 ? '改善' : '悪化'}（${formatDelta(capitalTurnover)}）です。`;
      }
    } else if (nopatDelta !== null) {
      driverInsight = `収益性が${nopatDelta >= 0 ? '改善' : '悪化'}しています（${formatDelta(nopatRate)}）。`;
    } else if (turnoverDelta !== null) {
      driverInsight = `資本効率が${turnoverDelta >= 0 ? '改善' : '悪化'}しています（${formatDelta(capitalTurnover)}）。`;
    }
  } else if (!compareEnabled) {
    driverInsight = '比較を有効にすると主要な変化要因が表示されます。';
  }

  const gapText =
    spreadValue !== null
      ? `${Math.abs(spreadValue * 100).toFixed(2)}pt`
      : null;
  const decisionHeadline =
    spreadValue === null
      ? 'WACC未設定のため判定は保留です。'
      : spreadValue > 0
      ? `ROICがWACCを${gapText}上回っています。`
      : spreadValue < 0
      ? `ROICがWACCを${gapText}下回っています。`
      : 'ROICがWACCと同水準です。';

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            経営サマリー
          </CardTitle>
          <Badge
            variant={
              status === 'positive'
                ? 'default'
                : status === 'negative'
                ? 'destructive'
                : 'secondary'
            }
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          ROICの状態と主要ドライバーを一目で把握できるビュー
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">ROIC</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {formatKpi(roic)}
            </div>
            {waccValue !== null && (
              <div className="mt-1 text-xs text-muted-foreground">
                WACC {formatKpiValue(waccValue, 'percent', '%')}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">NOPAT率</div>
            <div className="mt-1 text-xl font-bold tabular-nums">
              {formatKpi(nopatRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              収益性ドライバー
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">投下資本回転率</div>
            <div className="mt-1 text-xl font-bold tabular-nums">
              {formatKpi(capitalTurnover)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              資本効率ドライバー
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">投下資本</div>
            <div className="mt-1 text-lg font-bold tabular-nums">
              {formatKpi(investedCapital)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              資産・負債の構成を分解タブで確認
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">意思決定の視点</div>
            <div className="mt-1 text-sm text-foreground">
              {decisionHeadline}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ROIC = NOPAT率 × 投下資本回転率。{driverInsight}
            </div>
            {(hasWarnings || bsSubstituted || waccValue === null) && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                <div className="space-y-1">
                  {waccValue === null && <div>WACC未設定のため判定は参考値です。</div>}
                  {bsSubstituted && <div>一部BSが実績値で代替されています。</div>}
                  {hasWarnings && <div>注意事項があります。詳細は警告バナーを確認してください。</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">ROICスプレッド</div>
            <div className="mt-1 flex items-center gap-2">
              {status === 'positive' ? (
                <TrendingUp className="h-4 w-4 text-chart-3" />
              ) : status === 'negative' ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xl font-bold tabular-nums">
                {formatKpi(roicSpread)}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              資本コストとの差
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/70 p-3">
            <div className="text-xs text-muted-foreground">EVA（価値創造額）</div>
            <div className={cn("mt-1 text-xl font-bold tabular-nums", evaTone)}>
              {evaValue !== null ? formatKpiValue(evaValue, 'currency', '') : '-'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              (ROIC − WACC) × 投下資本
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
