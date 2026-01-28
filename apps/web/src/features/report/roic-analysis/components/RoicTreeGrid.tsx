'use client';

import { useMemo, useRef, useCallback } from 'react';
import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Freeze,
  Resize,
  Filter,
  Sort,
} from '@syncfusion/ej2-react-treegrid';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicTreeLine, SimulatedValues } from '../types';
import { RoicTreeSection } from '../types';
import { formatCurrency } from '../lib/roic-calculator';

interface RoicTreeGridProps {
  tree: BffRoicTreeLine[];
  simulatedValues: SimulatedValues;
  compareEnabled: boolean;
  onValueChange: (lineId: string, value: number) => void;
}

interface GridRow {
  id: string;
  parentId: string | null;
  lineId: string;
  displayName: string;
  section: RoicTreeSection;
  lineType: string;
  isEditable: boolean;
  indentLevel: number;
  originalValue: number | null;
  simulatedValue: number | null;
  compareValue: number | null;
  changePercent: number;
  changeAmount: number;
}

// SyncFusion用のCSSを注入
const gridStyles = `
  .roic-treegrid .e-treegrid .e-gridheader {
    background-color: hsl(var(--muted));
    font-weight: 600;
  }
  .roic-treegrid .e-treegrid .e-content {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  .roic-treegrid .e-treegrid .e-row:hover {
    background-color: hsl(var(--accent));
  }
  .roic-treegrid .roic-positive {
    color: hsl(var(--chart-3));
    font-weight: 600;
  }
  .roic-treegrid .roic-negative {
    color: hsl(var(--destructive));
    font-weight: 600;
  }
  .roic-treegrid .roic-header-row {
    background-color: hsl(var(--muted) / 0.5);
    font-weight: 600;
  }
  .roic-treegrid .roic-changed-row {
    background-color: hsl(var(--primary) / 0.1);
  }
  .roic-treegrid .roic-section-nopat {
    border-left: 3px solid hsl(var(--chart-1));
  }
  .roic-treegrid .roic-section-invested_capital {
    border-left: 3px solid hsl(var(--chart-3));
  }
  .roic-treegrid .roic-section-decomposition {
    border-left: 3px solid hsl(var(--chart-4));
  }
  .roic-treegrid .roic-section-roic {
    border-left: 3px solid hsl(var(--chart-5));
  }
`;

export function RoicTreeGrid({
  tree,
  simulatedValues,
  compareEnabled,
  onValueChange,
}: RoicTreeGridProps) {
  const treeGridRef = useRef<TreeGridComponent | null>(null);

  // ツリーデータをグリッドデータに変換
  const gridData = useMemo(() => {
    const rows: GridRow[] = [];

    tree.forEach((line) => {
      const originalValue = line.originalValue ?? 0;
      const simulatedValue = simulatedValues[line.lineId] ?? originalValue;
      const changeAmount = simulatedValue - originalValue;
      const changePercent = originalValue !== 0
        ? (changeAmount / Math.abs(originalValue)) * 100
        : 0;

      rows.push({
        id: line.lineId,
        parentId: line.parentLineId,
        lineId: line.lineId,
        displayName: line.displayName,
        section: line.section,
        lineType: line.lineType,
        isEditable: line.isEditable,
        indentLevel: line.indentLevel,
        originalValue: line.originalValue,
        simulatedValue,
        compareValue: line.compareValue,
        changePercent,
        changeAmount,
      });
    });

    return rows;
  }, [tree, simulatedValues]);

  // セル編集ハンドラ
  const handleCellSave = useCallback(
    (args: { rowData: GridRow; columnName: string; value: unknown }) => {
      const { rowData, columnName, value } = args;

      if (columnName !== 'simulatedValue' || !rowData.isEditable) {
        args.value = rowData.simulatedValue; // 元の値に戻す
        return;
      }

      const numValue = Number(value);
      if (!isNaN(numValue)) {
        onValueChange(rowData.lineId, numValue);
      }
    },
    [onValueChange]
  );

  // セルスタイリング
  const queryCellInfo = useCallback(
    (args: { column: { field: string }; cell: HTMLElement; data: GridRow }) => {
      const { column, cell, data: rowData } = args;
      const field = column.field;

      // セクション別の左ボーダー
      if (field === 'displayName') {
        cell.classList.add(`roic-section-${rowData.section}`);
      }

      // ヘッダー行のスタイル
      if (rowData.lineType === 'header') {
        cell.classList.add('roic-header-row');
      }

      // 変更された行のハイライト
      if (Math.abs(rowData.changePercent) > 0.1) {
        cell.classList.add('roic-changed-row');
      }

      // 数値列の書式設定
      if (field === 'changePercent' || field === 'changeAmount') {
        if (rowData.changeAmount > 0) {
          cell.classList.add('roic-positive');
        } else if (rowData.changeAmount < 0) {
          cell.classList.add('roic-negative');
        }
      }

      // 金額列の右寄せ
      if (['originalValue', 'simulatedValue', 'compareValue', 'changeAmount'].includes(field)) {
        cell.style.textAlign = 'right';
      }
    },
    []
  );

  const editSettings = {
    allowEditing: true,
    mode: 'Batch' as const,
    allowEditOnDblClick: true,
  };

  // 金額フォーマット用テンプレート
  const amountTemplate = (value: number | null) => {
    if (value === null) return <span className="text-muted-foreground">-</span>;
    return <span className="tabular-nums">{formatCurrency(value)}</span>;
  };

  // 変化率テンプレート
  const changePercentTemplate = (props: GridRow) => {
    if (Math.abs(props.changePercent) < 0.1) {
      return <span className="text-muted-foreground">-</span>;
    }
    const isPositive = props.changePercent >= 0;
    return (
      <span className={cn(
        'tabular-nums font-medium',
        isPositive ? 'text-chart-3' : 'text-destructive'
      )}>
        {isPositive ? '+' : ''}{props.changePercent.toFixed(1)}%
      </span>
    );
  };

  // 変化額テンプレート
  const changeAmountTemplate = (props: GridRow) => {
    if (Math.abs(props.changeAmount) < 0.1) {
      return <span className="text-muted-foreground">-</span>;
    }
    const isPositive = props.changeAmount >= 0;
    return (
      <span className={cn(
        'tabular-nums font-medium',
        isPositive ? 'text-chart-3' : 'text-destructive'
      )}>
        {isPositive ? '+' : ''}{formatCurrency(props.changeAmount)}
      </span>
    );
  };

  // セクションサマリー
  const sectionSummary = useMemo(() => {
    const sections: RoicTreeSection[] = [
      RoicTreeSection.NOPAT,
      RoicTreeSection.INVESTED_CAPITAL,
      RoicTreeSection.ROIC,
      RoicTreeSection.DECOMPOSITION,
    ];
    const sectionNames: Record<RoicTreeSection, string> = {
      [RoicTreeSection.NOPAT]: 'NOPAT',
      [RoicTreeSection.INVESTED_CAPITAL]: '投下資本',
      [RoicTreeSection.ROIC]: 'ROIC計算',
      [RoicTreeSection.DECOMPOSITION]: '分解',
    };

    return sections.flatMap((section) => {
      const lines = gridData.filter((r) => r.section === section);
      if (lines.length === 0) {
        return [];
      }
      const minIndent = Math.min(...lines.map((l) => l.indentLevel));
      const rootLines = lines.filter((l) => l.indentLevel === minIndent);
      const total = rootLines.reduce((sum, l) => sum + (l.simulatedValue ?? 0), 0);
      const originalTotal = rootLines.reduce((sum, l) => sum + (l.originalValue ?? 0), 0);
      const change = total - originalTotal;

      return [{
        section,
        name: sectionNames[section] || section,
        total,
        change,
      }];
    });
  }, [gridData]);

  return (
    <div className="roic-treegrid space-y-4">
      <style>{gridStyles}</style>

      {/* セクションサマリー */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sectionSummary.map((s) => (
          <Card key={s.section} className="p-4">
            <div className="text-xs text-muted-foreground">{s.name}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold">
                {formatCurrency(s.total)}
              </span>
              {Math.abs(s.change) > 0.1 && (
                <Badge
                  variant={s.change >= 0 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {s.change >= 0 ? '+' : ''}{formatCurrency(s.change)}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* TreeGrid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span>ROIC構成要素（TreeGrid）</span>
            <span className="text-xs font-normal text-muted-foreground">
              ダブルクリックで編集
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TreeGridComponent
            ref={treeGridRef}
            dataSource={gridData}
            idMapping="id"
            parentIdMapping="parentId"
            treeColumnIndex={0}
            allowResizing={true}
            allowFiltering={false}
            allowSorting={false}
            editSettings={editSettings}
            frozenColumns={1}
            height={500}
            rowHeight={36}
            queryCellInfo={queryCellInfo}
            cellSave={(args) => handleCellSave(args as { rowData: GridRow; columnName: string; value: unknown })}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="displayName"
                headerText="項目"
                width={220}
                textAlign="Left"
                allowEditing={false}
                freeze="Left"
              />
              <ColumnDirective
                field="simulatedValue"
                headerText="シミュレーション値"
                width={150}
                textAlign="Right"
                allowEditing={true}
                format="N0"
                template={(props: GridRow) => amountTemplate(props.simulatedValue)}
              />
              <ColumnDirective
                field="originalValue"
                headerText="元値"
                width={130}
                textAlign="Right"
                allowEditing={false}
                template={(props: GridRow) => amountTemplate(props.originalValue)}
              />
              <ColumnDirective
                field="changeAmount"
                headerText="変化額"
                width={120}
                textAlign="Right"
                allowEditing={false}
                template={changeAmountTemplate}
              />
              <ColumnDirective
                field="changePercent"
                headerText="変化率"
                width={100}
                textAlign="Right"
                allowEditing={false}
                template={changePercentTemplate}
              />
              {compareEnabled && (
                <ColumnDirective
                  field="compareValue"
                  headerText="比較値"
                  width={130}
                  textAlign="Right"
                  allowEditing={false}
                  template={(props: GridRow) => amountTemplate(props.compareValue)}
                />
              )}
            </ColumnsDirective>
            <Inject services={[Edit, Freeze, Resize, Filter, Sort]} />
          </TreeGridComponent>
        </CardContent>
      </Card>
    </div>
  );
}
