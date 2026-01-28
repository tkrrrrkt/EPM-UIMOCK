'use client';

import React from "react"

import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, ScrollArea } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { SimulatedTreeLine } from '../types';
import { formatCurrency } from '../lib/cvp-calculator';

interface CvpTreeProps {
  tree: SimulatedTreeLine[];
  hasChanges: boolean;
  onValueChange: (lineId: string, value: number) => void;
  onReset: () => void;
}

export function CvpTree({ tree, hasChanges, onValueChange, onReset }: CvpTreeProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">CVPツリー</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasChanges}
            className="gap-1 bg-transparent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            リセット
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">科目</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground w-32">元値</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground w-40">シミュ後</th>
              </tr>
            </thead>
            <tbody>
              {tree.map((line) => (
                <TreeRow key={line.lineId} line={line} onValueChange={onValueChange} />
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface TreeRowProps {
  line: SimulatedTreeLine;
  onValueChange: (lineId: string, value: number) => void;
}

function TreeRow({ line, onValueChange }: TreeRowProps) {
  const [editValue, setEditValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const isHeader = line.lineType === 'header';
  const isAdjustment = line.lineType === 'adjustment';

  const handleStartEdit = useCallback(() => {
    if (!line.isEditable) return;
    setEditValue(line.simulatedValue?.toString() || '');
    setIsEditing(true);
  }, [line.isEditable, line.simulatedValue]);

  const handleEndEdit = useCallback(() => {
    setIsEditing(false);
    const numValue = parseFloat(editValue.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      onValueChange(line.lineId, numValue);
    }
  }, [editValue, line.lineId, onValueChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEndEdit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleEndEdit]
  );

  return (
    <tr
      className={cn(
        'border-b last:border-b-0',
        isHeader && 'bg-muted/50 font-medium',
        isAdjustment && 'italic text-muted-foreground',
        line.hasChanged && 'bg-primary/10'
      )}
    >
      {/* Display Name */}
      <td
        className="py-2 px-2"
        style={{ paddingLeft: `${line.indentLevel * 16 + 8}px` }}
      >
        {line.displayName}
      </td>

      {/* Original Value */}
      <td className="text-right py-2 px-2 tabular-nums text-muted-foreground">
        {line.originalValue !== null ? formatCurrency(line.originalValue) : '-'}
      </td>

      {/* Simulated Value */}
      <td className="text-right py-2 px-2">
        {line.isEditable ? (
          isEditing ? (
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEndEdit}
              onKeyDown={handleKeyDown}
              className="h-7 text-right tabular-nums w-full"
              autoFocus
            />
          ) : (
            <button
              type="button"
              className={cn(
                'w-full text-right tabular-nums px-2 py-1 rounded hover:bg-accent transition-colors',
                line.hasChanged && 'font-medium text-primary'
              )}
              onClick={handleStartEdit}
            >
              {line.simulatedValue !== null ? formatCurrency(line.simulatedValue) : '-'}
            </button>
          )
        ) : (
          <span
            className={cn(
              'tabular-nums',
              line.hasChanged && 'font-medium text-primary'
            )}
          >
            {line.simulatedValue !== null ? formatCurrency(line.simulatedValue) : '-'}
          </span>
        )}
      </td>
    </tr>
  );
}
