import type { BffCvpKpiItem, SimulatedTreeLine, BffCvpBreakevenChartData, BffCvpWaterfallData } from '../types';

interface CvpValues {
  revenue: number | null;
  variableCost: number | null;
  fixedCost: number | null;
}

function extractCvpValues(tree: SimulatedTreeLine[]): CvpValues {
  // Find revenue (売上高), variable cost (変動費計), fixed cost (固定費計)
  const revenueHeader = tree.find(l => l.lineNo === 1);
  const variableHeader = tree.find(l => l.lineNo === 10);
  const fixedHeader = tree.find(l => l.lineNo === 20);

  return {
    revenue: revenueHeader?.simulatedValue ?? null,
    variableCost: variableHeader?.simulatedValue ?? null,
    fixedCost: fixedHeader?.simulatedValue ?? null,
  };
}

export function recalculateKpis(
  originalKpis: BffCvpKpiItem[],
  tree: SimulatedTreeLine[]
): BffCvpKpiItem[] {
  const { revenue, variableCost, fixedCost } = extractCvpValues(tree);

  if (revenue === null || variableCost === null || fixedCost === null) {
    return originalKpis;
  }

  const marginalProfit = revenue - variableCost;
  const marginalRate = revenue !== 0 ? marginalProfit / revenue : null;
  const breakevenSales = marginalRate && marginalRate !== 0 ? fixedCost / marginalRate : null;
  const safetyMargin = breakevenSales !== null ? revenue - breakevenSales : null;
  const safetyRate = revenue !== 0 && safetyMargin !== null ? safetyMargin / revenue : null;

  const kpiCalculations: Record<string, number | null> = {
    'kpi-revenue': revenue,
    'kpi-variable': variableCost,
    'kpi-marginal': marginalProfit,
    'kpi-marginal-rate': marginalRate,
    'kpi-fixed': fixedCost,
    'kpi-breakeven': breakevenSales,
    'kpi-safety-margin': safetyMargin,
    'kpi-safety-rate': safetyRate,
  };

  return originalKpis.map((kpi) => ({
    ...kpi,
    simulatedValue: kpiCalculations[kpi.id] ?? kpi.simulatedValue,
    isCalculable: kpiCalculations[kpi.id] !== null,
  }));
}

export function recalculateBreakevenChart(
  tree: SimulatedTreeLine[],
  originalChart: BffCvpBreakevenChartData
): BffCvpBreakevenChartData {
  const { revenue, variableCost, fixedCost } = extractCvpValues(tree);

  if (revenue === null || variableCost === null || fixedCost === null || revenue === 0) {
    return { ...originalChart, isCalculable: false, breakevenPoint: null };
  }

  const marginalRate = (revenue - variableCost) / revenue;

  if (marginalRate === 0) {
    return { ...originalChart, isCalculable: false, breakevenPoint: null };
  }

  const breakevenX = fixedCost / marginalRate;
  const maxSales = Math.max(revenue * 1.5, breakevenX * 1.5);

  const salesLine = [
    { x: 0, y: 0 },
    { x: maxSales / 3, y: maxSales / 3 },
    { x: (maxSales * 2) / 3, y: (maxSales * 2) / 3 },
    { x: maxSales, y: maxSales },
  ];

  const variableRate = variableCost / revenue;
  const totalCostLine = [
    { x: 0, y: fixedCost },
    { x: maxSales / 3, y: fixedCost + (maxSales / 3) * variableRate },
    { x: (maxSales * 2) / 3, y: fixedCost + ((maxSales * 2) / 3) * variableRate },
    { x: maxSales, y: fixedCost + maxSales * variableRate },
  ];

  const fixedCostLine = [
    { x: 0, y: fixedCost },
    { x: maxSales, y: fixedCost },
  ];

  return {
    maxSales,
    salesLine,
    totalCostLine,
    fixedCostLine,
    breakevenPoint: { x: breakevenX, y: breakevenX },
    isCalculable: true,
  };
}

export function recalculateWaterfall(tree: SimulatedTreeLine[]): BffCvpWaterfallData {
  const { revenue, variableCost, fixedCost } = extractCvpValues(tree);

  if (revenue === null || variableCost === null || fixedCost === null) {
    return { items: [] };
  }

  const marginalProfit = revenue - variableCost;
  const operatingProfit = marginalProfit - fixedCost;

  return {
    items: [
      { id: 'wf-1', name: '売上高', value: revenue, type: 'start' },
      { id: 'wf-2', name: '変動費', value: -variableCost, type: 'decrease' },
      { id: 'wf-3', name: '限界利益', value: marginalProfit, type: 'subtotal' },
      { id: 'wf-4', name: '固定費', value: -fixedCost, type: 'decrease' },
      { id: 'wf-5', name: '営業利益', value: operatingProfit, type: 'end' },
    ],
  };
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('ja-JP', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value === null) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatValue(value: number | null, format: 'currency' | 'percent'): string {
  if (format === 'percent') {
    return formatPercent(value);
  }
  return formatCurrency(value);
}
