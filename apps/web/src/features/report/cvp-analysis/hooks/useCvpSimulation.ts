'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  BffCvpDataResponse,
  BffCvpKpiItem,
  SimulatedTreeLine,
  BffCvpBreakevenChartData,
  BffCvpWaterfallData,
} from '../types';
import {
  initializeSimulatedTree,
  updateSimulatedValue,
  resetSimulatedTree,
} from '../lib/tree-utils';
import {
  recalculateKpis,
  recalculateBreakevenChart,
  recalculateWaterfall,
} from '../lib/cvp-calculator';

export interface SimulationState {
  tree: SimulatedTreeLine[];
  kpis: BffCvpKpiItem[];
  breakevenChart: BffCvpBreakevenChartData;
  waterfallSimulated: BffCvpWaterfallData;
  hasChanges: boolean;
}

export function useCvpSimulation(data: BffCvpDataResponse | undefined) {
  const [simulatedTree, setSimulatedTree] = useState<SimulatedTreeLine[]>([]);

  // Initialize tree when data changes
  useEffect(() => {
    if (data?.tree) {
      setSimulatedTree(initializeSimulatedTree(data.tree));
    }
  }, [data?.tree]);

  const handleValueChange = useCallback((lineId: string, newValue: number) => {
    setSimulatedTree((prev) => updateSimulatedValue(prev, lineId, newValue));
  }, []);

  const handleReset = useCallback(() => {
    setSimulatedTree((prev) => resetSimulatedTree(prev));
  }, []);

  const hasChanges = useMemo(
    () => simulatedTree.some((line) => line.hasChanged),
    [simulatedTree]
  );

  const simulatedKpis = useMemo(() => {
    if (!data?.kpis) return [];
    return recalculateKpis(data.kpis, simulatedTree);
  }, [data?.kpis, simulatedTree]);

  const simulatedBreakevenChart = useMemo(() => {
    if (!data?.breakevenChart) return data?.breakevenChart;
    return recalculateBreakevenChart(simulatedTree, data.breakevenChart);
  }, [data?.breakevenChart, simulatedTree]);

  const simulatedWaterfall = useMemo(() => {
    return recalculateWaterfall(simulatedTree);
  }, [simulatedTree]);

  return {
    tree: simulatedTree,
    kpis: simulatedKpis,
    breakevenChart: simulatedBreakevenChart,
    waterfallSimulated: simulatedWaterfall,
    hasChanges,
    onValueChange: handleValueChange,
    onReset: handleReset,
  };
}
