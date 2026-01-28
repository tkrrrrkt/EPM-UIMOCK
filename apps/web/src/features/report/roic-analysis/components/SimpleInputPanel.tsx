'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  ScrollArea,
  Skeleton,
} from '@/shared/ui';
import { cn } from '@/lib/utils';
import type {
  BffRoicSimpleInputResponse,
  BffRoicSimpleInputLine,
  BffRoicSimpleInputSaveItem,
} from '../types';
import { formatCurrency } from '../lib/roic-calculator';

interface SimpleInputPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiscalYear: number;
  simpleInputData: BffRoicSimpleInputResponse | null;
  isLoading: boolean;
  includeSubDepartments: boolean;
  onSave: (
    operatingAssets: BffRoicSimpleInputSaveItem[],
    operatingLiabilities: BffRoicSimpleInputSaveItem[]
  ) => Promise<void>;
}

function InputLine({
  line,
  h1Value,
  h2Value,
  onH1Change,
  onH2Change,
}: {
  line: BffRoicSimpleInputLine;
  h1Value: number | null;
  h2Value: number | null;
  onH1Change: (value: number | null) => void;
  onH2Change: (value: number | null) => void;
}) {
  const annualAvg =
    h1Value !== null && h2Value !== null
      ? (h1Value + h2Value) / 2
      : h1Value ?? h2Value;

  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-2 border-b border-border py-2',
        line.isAggregate && 'bg-muted/50 font-semibold'
      )}
      style={{ paddingLeft: `${line.indentLevel * 16 + 8}px` }}
    >
      {/* 科目名 */}
      <div className="col-span-1 truncate pr-2">{line.subjectName}</div>

      {/* 上期 */}
      <div className="col-span-1">
        {line.isEditable ? (
          <Input
            type="number"
            value={h1Value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onH1Change(val === '' ? null : parseFloat(val));
            }}
            className="h-8 text-right font-mono"
            placeholder="上期"
          />
        ) : (
          <div className="h-8 py-1.5 text-right font-mono text-muted-foreground">
            {h1Value !== null ? formatCurrency(h1Value) : '-'}
          </div>
        )}
      </div>

      {/* 下期 */}
      <div className="col-span-1">
        {line.isEditable ? (
          <Input
            type="number"
            value={h2Value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onH2Change(val === '' ? null : parseFloat(val));
            }}
            className="h-8 text-right font-mono"
            placeholder="下期"
          />
        ) : (
          <div className="h-8 py-1.5 text-right font-mono text-muted-foreground">
            {h2Value !== null ? formatCurrency(h2Value) : '-'}
          </div>
        )}
      </div>

      {/* 通期（平均） */}
      <div className="col-span-1 py-1.5 text-right font-mono text-muted-foreground">
        {annualAvg !== null ? formatCurrency(annualAvg) : '-'}
      </div>
    </div>
  );
}

export function SimpleInputPanel({
  open,
  onOpenChange,
  fiscalYear,
  simpleInputData,
  isLoading,
  includeSubDepartments,
  onSave,
}: SimpleInputPanelProps) {
  const [assetValues, setAssetValues] = useState<
    Record<string, { h1: number | null; h2: number | null }>
  >({});
  const [liabilityValues, setLiabilityValues] = useState<
    Record<string, { h1: number | null; h2: number | null }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // データ読み込み時に初期化
  useEffect(() => {
    if (simpleInputData) {
      const assets: Record<string, { h1: number | null; h2: number | null }> =
        {};
      simpleInputData.operatingAssets.forEach((line) => {
        assets[line.subjectId] = {
          h1: line.h1Value,
          h2: line.h2Value,
        };
      });
      setAssetValues(assets);

      const liabilities: Record<
        string,
        { h1: number | null; h2: number | null }
      > = {};
      simpleInputData.operatingLiabilities.forEach((line) => {
        liabilities[line.subjectId] = {
          h1: line.h1Value,
          h2: line.h2Value,
        };
      });
      setLiabilityValues(liabilities);
    }
  }, [simpleInputData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const operatingAssets: BffRoicSimpleInputSaveItem[] = Object.entries(
        assetValues
      )
        .filter(([id]) => {
          const line = simpleInputData?.operatingAssets.find(
            (l) => l.subjectId === id
          );
          return line?.isEditable;
        })
        .map(([subjectId, values]) => ({
          subjectId,
          h1Value: values.h1,
          h2Value: values.h2,
        }));

      const operatingLiabilities: BffRoicSimpleInputSaveItem[] = Object.entries(
        liabilityValues
      )
        .filter(([id]) => {
          const line = simpleInputData?.operatingLiabilities.find(
            (l) => l.subjectId === id
          );
          return line?.isEditable;
        })
        .map(([subjectId, values]) => ({
          subjectId,
          h1Value: values.h1,
          h2Value: values.h2,
        }));

      await onSave(operatingAssets, operatingLiabilities);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{fiscalYear}年度 営業資産・営業負債</SheetTitle>
          <SheetDescription>
            半期の営業資産・営業負債を入力してください
          </SheetDescription>
        </SheetHeader>

        {includeSubDepartments ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            配下集約時は入力できません
          </div>
        ) : isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : simpleInputData ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 p-4">
              {/* ヘッダー */}
              <div className="grid grid-cols-4 gap-2 border-b-2 border-border pb-2 text-sm font-medium">
                <div>科目</div>
                <div className="text-right">上期(H1)</div>
                <div className="text-right">下期(H2)</div>
                <div className="text-right text-muted-foreground">通期</div>
              </div>

              {/* 営業資産 */}
              <div>
                <Label className="mb-2 block font-semibold">営業資産</Label>
                {simpleInputData.operatingAssets.map((line) => (
                  <InputLine
                    key={line.subjectId}
                    line={line}
                    h1Value={assetValues[line.subjectId]?.h1 ?? null}
                    h2Value={assetValues[line.subjectId]?.h2 ?? null}
                    onH1Change={(val) =>
                      setAssetValues((prev) => ({
                        ...prev,
                        [line.subjectId]: {
                          ...prev[line.subjectId],
                          h1: val,
                        },
                      }))
                    }
                    onH2Change={(val) =>
                      setAssetValues((prev) => ({
                        ...prev,
                        [line.subjectId]: {
                          ...prev[line.subjectId],
                          h2: val,
                        },
                      }))
                    }
                  />
                ))}
              </div>

              {/* 営業負債 */}
              <div>
                <Label className="mb-2 block font-semibold">営業負債</Label>
                {simpleInputData.operatingLiabilities.map((line) => (
                  <InputLine
                    key={line.subjectId}
                    line={line}
                    h1Value={liabilityValues[line.subjectId]?.h1 ?? null}
                    h2Value={liabilityValues[line.subjectId]?.h2 ?? null}
                    onH1Change={(val) =>
                      setLiabilityValues((prev) => ({
                        ...prev,
                        [line.subjectId]: {
                          ...prev[line.subjectId],
                          h1: val,
                        },
                      }))
                    }
                    onH2Change={(val) =>
                      setLiabilityValues((prev) => ({
                        ...prev,
                        [line.subjectId]: {
                          ...prev[line.subjectId],
                          h2: val,
                        },
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : null}

        {/* フッターボタン */}
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
