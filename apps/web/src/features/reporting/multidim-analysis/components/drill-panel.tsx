'use client';

/**
 * DrillPanel Component
 *
 * Shows drilldown and drillthrough options for selected cell
 * Features:
 * - Selected cell info display
 * - Drilldown dimension selector
 * - Drilldown results (bar chart style)
 * - Drillthrough detail table with pagination
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.5)
 */

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronRight, Table2, Loader2, X } from 'lucide-react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import type {
  BffDrilldownResponseDto,
  BffDrillthroughResponseDto,
} from '@epm/contracts/bff/multidim-analysis';
import { usePivotStore } from '../store/pivot-store';
import { bffClient } from '../api/client';
import { cn } from '@/lib/utils';

const numberFormatter = new Intl.NumberFormat('ja-JP');
const currencyFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

interface DrilldownResultProps {
  data: BffDrilldownResponseDto;
}

function DrilldownResult({ data }: DrilldownResultProps) {
  const maxValue = Math.max(...data.items.map((i) => i.value));

  return (
    <div className="space-y-2">
      {data.items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">
              {numberFormatter.format(item.value)} ({item.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t text-sm">
        <span className="font-medium">合計: </span>
        <span>{numberFormatter.format(data.total)}</span>
      </div>
    </div>
  );
}

interface DrillthroughResultProps {
  data: BffDrillthroughResponseDto;
  onPageChange: (page: number) => void;
}

function DrillthroughResult({ data, onPageChange }: DrillthroughResultProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">日付</th>
              <th className="text-left py-2 px-2">組織</th>
              <th className="text-left py-2 px-2">勘定科目</th>
              <th className="text-left py-2 px-2">摘要</th>
              <th className="text-right py-2 px-2">金額</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/50">
                <td className="py-2 px-2">{item.date}</td>
                <td className="py-2 px-2">{item.org}</td>
                <td className="py-2 px-2">{item.account}</td>
                <td className="py-2 px-2 truncate max-w-[150px]">{item.description}</td>
                <td className="py-2 px-2 text-right">
                  {currencyFormatter.format(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data.total.toLocaleString()} 件中 {(data.page - 1) * data.pageSize + 1} -{' '}
          {Math.min(data.page * data.pageSize, data.total)} 件
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={data.page <= 1}
            onClick={() => onPageChange(data.page - 1)}
          >
            前へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data.page >= data.totalPages}
            onClick={() => onPageChange(data.page + 1)}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DrillPanel() {
  const { selectedCell, setSelectedCell, availableFields, rows, globalFilters } = usePivotStore();

  const [drillDimension, setDrillDimension] = useState<string>('org');
  const [drilldownData, setDrilldownData] = useState<BffDrilldownResponseDto | null>(null);
  const [drillthroughData, setDrillthroughData] = useState<BffDrillthroughResponseDto | null>(
    null
  );
  const [isLoadingDrilldown, setIsLoadingDrilldown] = useState(false);
  const [isLoadingDrillthrough, setIsLoadingDrillthrough] = useState(false);
  const [drillthroughPage, setDrillthroughPage] = useState(1);

  // Build conditions from selected cell
  const buildConditions = useCallback(() => {
    if (!selectedCell) return {};

    const conditions: Record<string, string> = {};

    // Map row headers to conditions
    rows.forEach((fieldId, index) => {
      const value = selectedCell.rowHeaders[index];
      if (value) {
        conditions[fieldId] = value;
      }
    });

    // Add period from column header
    if (selectedCell.colHeader) {
      conditions.period = selectedCell.colHeader;
    }

    return conditions;
  }, [selectedCell, rows]);

  // Fetch drilldown data
  const fetchDrilldown = useCallback(async () => {
    if (!selectedCell) return;

    setIsLoadingDrilldown(true);
    try {
      const result = await bffClient.executeDrilldown({
        conditions: buildConditions(),
        drillDimension,
        topN: 10,
      });
      setDrilldownData(result);
    } catch (err) {
      console.error('Drilldown error:', err);
      setDrilldownData(null);
    } finally {
      setIsLoadingDrilldown(false);
    }
  }, [selectedCell, drillDimension, buildConditions]);

  // Fetch drillthrough data
  const fetchDrillthrough = useCallback(
    async (page: number = 1) => {
      if (!selectedCell) return;

      setIsLoadingDrillthrough(true);
      try {
        const result = await bffClient.executeDrillthrough({
          conditions: buildConditions(),
          page,
          pageSize: 20,
        });
        setDrillthroughData(result);
        setDrillthroughPage(page);
      } catch (err) {
        console.error('Drillthrough error:', err);
        setDrillthroughData(null);
      } finally {
        setIsLoadingDrillthrough(false);
      }
    },
    [selectedCell, buildConditions]
  );

  // Reset when cell changes
  useEffect(() => {
    setDrilldownData(null);
    setDrillthroughData(null);
    setDrillthroughPage(1);
  }, [selectedCell]);

  if (!selectedCell) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">ドリル分析</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-center p-4">
          <div>
            <p className="text-sm">セルをクリックして</p>
            <p className="text-sm">詳細分析を開始</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">ドリル分析</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSelectedCell(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Cell Info */}
      <div className="px-4 py-3 bg-muted/30 border-b space-y-1">
        <div className="text-xs text-muted-foreground">選択セル</div>
        <div className="text-sm">
          <span className="font-medium">{selectedCell.rowHeaders.join(' > ')}</span>
          <span className="text-muted-foreground"> / </span>
          <span>{selectedCell.colHeader}</span>
        </div>
        <div className="text-lg font-semibold">
          {selectedCell.value !== null
            ? numberFormatter.format(selectedCell.value)
            : '-'}
        </div>
      </div>

      {/* Drill Tabs */}
      <Tabs defaultValue="drilldown" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="drilldown" className="flex-1">
            <ChevronDown className="h-4 w-4 mr-1" />
            ドリルダウン
          </TabsTrigger>
          <TabsTrigger value="drillthrough" className="flex-1">
            <Table2 className="h-4 w-4 mr-1" />
            ドリルスルー
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drilldown" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Dimension Selector */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">展開する軸</label>
            <Select value={drillDimension} onValueChange={setDrillDimension}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFields
                  .filter((f) => f.category !== 'option' || f.id !== 'project')
                  .map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.nameJa}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchDrilldown} disabled={isLoadingDrilldown} className="w-full">
              {isLoadingDrilldown ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              実行
            </Button>
          </div>

          {/* Results */}
          {drilldownData && <DrilldownResult data={drilldownData} />}
        </TabsContent>

        <TabsContent value="drillthrough" className="flex-1 overflow-y-auto p-4 space-y-4">
          <Button
            onClick={() => fetchDrillthrough(1)}
            disabled={isLoadingDrillthrough}
            className="w-full"
          >
            {isLoadingDrillthrough ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Table2 className="h-4 w-4 mr-2" />
            )}
            明細を取得
          </Button>

          {drillthroughData && (
            <DrillthroughResult
              data={drillthroughData}
              onPageChange={(page) => fetchDrillthrough(page)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
