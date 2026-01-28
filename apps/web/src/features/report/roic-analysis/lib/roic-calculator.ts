import type {
  BffRoicTreeLine,
  BffRoicKpiItem,
  SimulatedValues,
  RoicKpiFormat,
} from '../types';

/**
 * ツリーの値からKPIを再計算する
 */
export function recalculateKpis(
  tree: BffRoicTreeLine[],
  simulatedValues: SimulatedValues,
  effectiveTaxRate: number,
  waccRate: number | null
): Map<string, number | null> {
  const treeMap = new Map(tree.map((line) => [line.lineId, line]));
  const kpiMap = new Map<string, number | null>();

  // 各lineの値を取得（シミュレーション値があればそれを使用）
  const getValue = (lineId: string): number | null => {
    if (simulatedValues[lineId] !== undefined) {
      return simulatedValues[lineId];
    }
    const line = treeMap.get(lineId);
    return line?.originalValue ?? null;
  };

  // EBIT
  const ebit = getValue('ebit');
  kpiMap.set('ebit', ebit);

  // 実効税率
  kpiMap.set('effectiveTaxRate', effectiveTaxRate);

  // NOPAT = EBIT × (1 - 実効税率)
  const nopat = ebit !== null ? ebit * (1 - effectiveTaxRate) : null;
  kpiMap.set('nopat', nopat);

  // 営業資産
  const operatingAssets = getValue('operating_assets');
  kpiMap.set('operatingAssets', operatingAssets);

  // 営業負債
  const operatingLiabilities = getValue('operating_liabilities');
  kpiMap.set('operatingLiabilities', operatingLiabilities);

  // 投下資本 = 営業資産 - 営業負債
  const investedCapital =
    operatingAssets !== null && operatingLiabilities !== null
      ? operatingAssets - operatingLiabilities
      : null;
  kpiMap.set('investedCapital', investedCapital);

  // ROIC = NOPAT / 投下資本
  const roic =
    nopat !== null && investedCapital !== null && investedCapital !== 0
      ? nopat / investedCapital
      : null;
  kpiMap.set('roic', roic);

  // WACC
  kpiMap.set('wacc', waccRate);

  // ROICスプレッド = ROIC - WACC
  const roicSpread =
    roic !== null && waccRate !== null ? roic - waccRate : null;
  kpiMap.set('roicSpread', roicSpread);

  // 売上高の取得（ツリーに含まれている場合）
  const revenue = getValue('revenue') ?? 1000000000; // デフォルト値

  // NOPAT率 = NOPAT / 売上高
  const nopatRate = nopat !== null && revenue !== 0 ? nopat / revenue : null;
  kpiMap.set('nopatRate', nopatRate);

  // 資本回転率 = 売上高 / 投下資本
  const capitalTurnover =
    investedCapital !== null && investedCapital !== 0
      ? revenue / investedCapital
      : null;
  kpiMap.set('capitalTurnover', capitalTurnover);

  return kpiMap;
}

/**
 * シミュレーション値をKPIアイテムに適用
 */
export function applySimulatedValuesToKpis(
  kpis: BffRoicKpiItem[],
  simulatedKpis: Map<string, number | null>
): BffRoicKpiItem[] {
  return kpis.map((kpi) => {
    const simulatedValue = simulatedKpis.get(kpi.id);
    return {
      ...kpi,
      simulatedValue: simulatedValue ?? kpi.simulatedValue,
    };
  });
}

/**
 * 値をフォーマット
 */
export function formatKpiValue(
  value: number | null,
  format: RoicKpiFormat,
  unit: string
): string {
  if (value === null) return '-';

  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(2)}%`;
    case 'rate':
      return `${value.toFixed(2)}${unit}`;
    case 'currency':
      return `${formatCurrency(value)}${unit}`;
    default:
      return String(value);
  }
}

/**
 * 通貨フォーマット
 */
export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 100000000) {
    return `${(value / 100000000).toFixed(1)}億`;
  } else if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(0)}万`;
  }
  return value.toLocaleString();
}

/**
 * 変化率を計算
 */
export function calculateChangeRate(
  original: number | null,
  simulated: number | null
): number | null {
  if (original === null || simulated === null || original === 0) return null;
  return (simulated - original) / Math.abs(original);
}
