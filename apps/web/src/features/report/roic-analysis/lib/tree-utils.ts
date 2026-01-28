import type { BffRoicTreeLine, SimulatedValues } from '../types';

/**
 * ツリーをマップに変換
 */
export function buildTreeMap(
  tree: BffRoicTreeLine[]
): Map<string, BffRoicTreeLine> {
  return new Map(tree.map((line) => [line.lineId, line]));
}

/**
 * 親要素を再帰的に再計算
 */
export function recalculateParents(
  tree: BffRoicTreeLine[],
  changedLineId: string,
  simulatedValues: SimulatedValues
): SimulatedValues {
  const treeMap = buildTreeMap(tree);
  const newSimulatedValues = { ...simulatedValues };

  const line = treeMap.get(changedLineId);
  if (!line || !line.parentLineId) return newSimulatedValues;

  const parent = treeMap.get(line.parentLineId);
  if (!parent) return newSimulatedValues;

  // 親の子要素の合計を計算
  let sum = 0;
  for (const childId of parent.childLineIds) {
    const child = treeMap.get(childId);
    if (!child) continue;

    const value =
      newSimulatedValues[childId] !== undefined
        ? newSimulatedValues[childId]
        : child.originalValue ?? 0;

    sum += value * child.rollupCoefficient;
  }

  newSimulatedValues[parent.lineId] = sum;

  // さらに上位の親も再計算
  if (parent.parentLineId) {
    return recalculateParents(tree, parent.lineId, newSimulatedValues);
  }

  return newSimulatedValues;
}

/**
 * すべてのシミュレーション値をリセット
 */
export function resetSimulatedValues(): SimulatedValues {
  return {};
}

/**
 * 特定の行が変更されているか判定
 */
export function isLineChanged(
  lineId: string,
  originalValue: number | null,
  simulatedValues: SimulatedValues
): boolean {
  const simValue = simulatedValues[lineId];
  if (simValue === undefined) return false;
  return simValue !== originalValue;
}

/**
 * 変更された行のIDリストを取得
 */
export function getChangedLineIds(
  tree: BffRoicTreeLine[],
  simulatedValues: SimulatedValues
): string[] {
  return tree
    .filter((line) => isLineChanged(line.lineId, line.originalValue, simulatedValues))
    .map((line) => line.lineId);
}

/**
 * ツリーをセクション別にグループ化
 */
export function groupTreeBySection(
  tree: BffRoicTreeLine[]
): Record<string, BffRoicTreeLine[]> {
  return tree.reduce(
    (acc, line) => {
      const section = line.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(line);
      return acc;
    },
    {} as Record<string, BffRoicTreeLine[]>
  );
}

/**
 * 部門ツリーをフラット化
 */
export function flattenDepartments<T extends { children?: T[] }>(
  nodes: T[]
): T[] {
  const result: T[] = [];
  const traverse = (node: T) => {
    result.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return result;
}
