import type { BffCvpTreeLine, SimulatedTreeLine, BffCvpDepartmentNode } from '../types';

export function initializeSimulatedTree(tree: BffCvpTreeLine[]): SimulatedTreeLine[] {
  return tree.map((line) => ({
    ...line,
    simulatedValue: line.originalValue,
    hasChanged: false,
  }));
}

export function updateSimulatedValue(
  tree: SimulatedTreeLine[],
  lineId: string,
  newValue: number
): SimulatedTreeLine[] {
  const lineMap = new Map(tree.map((l) => [l.lineId, { ...l }]));
  const targetLine = lineMap.get(lineId);

  if (!targetLine) return tree;

  // Update the target line
  targetLine.simulatedValue = newValue;
  targetLine.hasChanged = targetLine.originalValue !== newValue;

  // If target has a parent, we need to recalculate parent totals
  if (targetLine.parentLineId) {
    recalculateParent(lineMap, targetLine.parentLineId);
  }

  return Array.from(lineMap.values()).sort((a, b) => a.lineNo - b.lineNo);
}

function recalculateParent(lineMap: Map<string, SimulatedTreeLine>, parentId: string): void {
  const parent = lineMap.get(parentId);
  if (!parent) return;

  // Sum all children
  const childSum = parent.childLineIds.reduce((sum, childId) => {
    const child = lineMap.get(childId);
    if (!child || child.simulatedValue === null) return sum;
    return sum + child.simulatedValue * child.rollupCoefficient;
  }, 0);

  parent.simulatedValue = childSum;
  parent.hasChanged = parent.originalValue !== childSum;

  // Recursively update grandparent
  if (parent.parentLineId) {
    recalculateParent(lineMap, parent.parentLineId);
  }
}

export function resetSimulatedTree(tree: SimulatedTreeLine[]): SimulatedTreeLine[] {
  return tree.map((line) => ({
    ...line,
    simulatedValue: line.originalValue,
    hasChanged: false,
  }));
}

export function flattenDepartmentTree(nodes: BffCvpDepartmentNode[]): BffCvpDepartmentNode[] {
  const result: BffCvpDepartmentNode[] = [];

  function traverse(nodeList: BffCvpDepartmentNode[]) {
    for (const node of nodeList) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

export function findDepartmentByStableId(
  nodes: BffCvpDepartmentNode[],
  stableId: string
): BffCvpDepartmentNode | null {
  for (const node of nodes) {
    if (node.stableId === stableId) return node;
    if (node.children) {
      const found = findDepartmentByStableId(node.children, stableId);
      if (found) return found;
    }
  }
  return null;
}
