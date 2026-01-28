'use client';

import React from "react"

import { useState } from 'react';
import { RotateCcw, ChevronRight, ChevronDown } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicTreeLine, SimulatedValues } from '../types';
import { formatCurrency } from '../lib/roic-calculator';
import { isLineChanged } from '../lib/tree-utils';

interface RoicTreeProps {
  tree: BffRoicTreeLine[];
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
  onValueChange: (lineId: string, value: number) => void;
  onReset: () => void;
}

function TreeLine({
  line,
  simulatedValues,
  compareEnabled,
  onValueChange,
  expandedIds,
  toggleExpand,
}: {
  line: BffRoicTreeLine;
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
  onValueChange: (lineId: string, value: number) => void;
  expandedIds: Set<string>;
  toggleExpand: (lineId: string) => void;
}) {
  const hasChildren = line.childLineIds.length > 0;
  const isExpanded = expandedIds.has(line.lineId);
  const isChanged = isLineChanged(
    line.lineId,
    line.originalValue,
    simulatedValues
  );

  const displayValue =
    simulatedValues[line.lineId] !== undefined
      ? simulatedValues[line.lineId]
      : line.originalValue;

  const formatValue = (value: number | null): string => {
    if (value === null) return '-';
    if (line.lineType === 'note' || line.section === 'roic') {
      // 比率やROIC自体はパーセント表示
      if (Math.abs(value) <= 1) {
        return `${(value * 100).toFixed(2)}%`;
      }
    }
    return formatCurrency(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onValueChange(line.lineId, value);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center border-b border-border py-2 transition-colors',
        isChanged && 'bg-primary/10',
        line.lineType === 'header' && 'bg-muted/50 font-semibold',
        line.lineType === 'note' && 'italic text-muted-foreground'
      )}
      style={{ paddingLeft: `${line.indentLevel * 24 + 8}px` }}
    >
      {/* 展開/折りたたみ */}
      <div className="w-6">
        {hasChildren && (
          <button
            type="button"
            onClick={() => toggleExpand(line.lineId)}
            className="rounded p-0.5 hover:bg-accent"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* 項目名 */}
      <div className="flex-1 truncate pr-4">{line.displayName}</div>

      {/* 値 */}
      <div className="flex items-center gap-4">
        {line.isEditable ? (
          <Input
            type="number"
            value={displayValue ?? ''}
            onChange={handleInputChange}
            className={cn(
              'h-8 w-36 text-right font-mono',
              isChanged && 'border-primary ring-1 ring-primary/30'
            )}
          />
        ) : (
          <div className="w-36 text-right font-mono">
            {formatValue(displayValue)}
          </div>
        )}

        {/* 比較値 */}
        {compareEnabled && (
          <div className="w-28 text-right font-mono text-muted-foreground">
            {formatValue(line.compareValue)}
          </div>
        )}
      </div>
    </div>
  );
}

export function RoicTree({
  tree,
  simulatedValues,
  compareEnabled,
  onValueChange,
  onReset,
}: RoicTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // デフォルトで全展開
    return new Set(tree.map((line) => line.lineId));
  });

  const toggleExpand = (lineId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const hasChanges = Object.keys(simulatedValues).length > 0;

  // 表示するツリーラインをフィルタリング（折りたたまれた子は非表示）
  const visibleLines = tree.filter((line) => {
    if (!line.parentLineId) return true;
    // 親が展開されているかチェック
    let currentParentId: string | null = line.parentLineId;
    while (currentParentId) {
      if (!expandedIds.has(currentParentId)) return false;
      const parent = tree.find((l) => l.lineId === currentParentId);
      currentParentId = parent?.parentLineId ?? null;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">ROICツリー</CardTitle>
          <p className="text-xs text-muted-foreground">
            編集可能な項目を変更してシミュレーション
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          リセット
        </Button>
      </CardHeader>
      <CardContent>
        {/* ヘッダー */}
        <div className="flex items-center border-b-2 border-border bg-muted/30 py-2 font-medium">
          <div className="w-6" />
          <div className="flex-1 pl-2">項目</div>
          <div className="w-36 pr-4 text-right">値</div>
          {compareEnabled && (
            <div className="w-28 text-right text-muted-foreground">比較</div>
          )}
        </div>

        {/* ツリー本体 */}
        <div className="max-h-96 overflow-y-auto">
          {visibleLines.map((line) => (
            <TreeLine
              key={line.lineId}
              line={line}
              simulatedValues={simulatedValues}
              compareEnabled={compareEnabled}
              onValueChange={onValueChange}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
