/**
 * Data Source Selector Component
 *
 * Purpose:
 * - Allow selecting data sources for widgets (Fact/KPI/Metric)
 * - Support multiple data sources with add/remove
 * - Configure labels for each source
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 14.1-14.6)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 12.3)
 *
 * TODO for future enhancement:
 * - Implement proper tree picker for Subject (Fact) selection
 * - Implement list picker for KPI definition selection
 * - Implement list picker for Metric selection
 * - These require backend endpoints:
 *   - GET /api/bff/reporting/dashboards/selectors/subjects (with hierarchy)
 *   - GET /api/bff/reporting/dashboards/selectors/kpi-definitions
 *   - GET /api/bff/reporting/dashboards/selectors/metrics
 */
'use client';

import { useState, useCallback } from 'react';
import {
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@/shared/ui';
import { X, Plus, Info } from 'lucide-react';
import type { DataSource, DataSourceType } from '@epm/contracts/bff/dashboard';

interface DataSourceSelectorProps {
  dataSources: DataSource[];
  onChange: (dataSources: DataSource[]) => void;
  className?: string;
}

/**
 * Data Source Selector Component
 * Manages multiple data sources for widgets
 */
export function DataSourceSelector({
  dataSources,
  onChange,
  className = '',
}: DataSourceSelectorProps) {
  // Handle add data source
  const handleAdd = useCallback(() => {
    const newSource: DataSource = {
      type: 'FACT',
      refId: '',
      label: 'データソース',
    };
    onChange([...dataSources, newSource]);
  }, [dataSources, onChange]);

  // Handle remove data source
  const handleRemove = useCallback(
    (index: number) => {
      onChange(dataSources.filter((_, i) => i !== index));
    },
    [dataSources, onChange]
  );

  // Handle update data source
  const handleUpdate = useCallback(
    (index: number, updates: Partial<DataSource>) => {
      const updated = dataSources.map((source, i) =>
        i === index ? { ...source, ...updates } : source
      );
      onChange(updated);
    },
    [dataSources, onChange]
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">データソース</Label>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" />
          追加
        </Button>
      </div>

      {/* Info message about future enhancements */}
      <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">データソース選択について</p>
            <p>
              現在は参照IDを直接入力する方式です。将来的には、種別に応じた選択UIが実装される予定です：
            </p>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>Fact: 勘定科目ツリーから選択</li>
              <li>KPI: KPI定義リストから選択</li>
              <li>Metric: 指標マスタリストから選択</li>
            </ul>
          </div>
        </div>
      </div>

      {dataSources.length === 0 ? (
        <div className="rounded-md bg-neutral-50 p-4 text-center">
          <p className="text-sm text-neutral-500">
            データソースが設定されていません
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdd}
            className="mt-2"
          >
            <Plus className="mr-1 h-3 w-3" />
            最初のデータソースを追加
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {dataSources.map((source, index) => (
            <div
              key={index}
              className="rounded-lg border border-neutral-200 p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-600">
                  データソース {index + 1}
                </Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Data Source Type */}
              <div className="space-y-2">
                <Label htmlFor={`source-type-${index}`} className="text-xs text-neutral-600">
                  種別
                </Label>
                <Select
                  value={source.type}
                  onValueChange={(value) =>
                    handleUpdate(index, { type: value as DataSourceType })
                  }
                >
                  <SelectTrigger id={`source-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FACT">Fact (勘定科目)</SelectItem>
                    <SelectItem value="KPI">KPI (KPI定義)</SelectItem>
                    <SelectItem value="METRIC">Metric (指標マスタ)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  {source.type === 'FACT' && '勘定科目データを参照します'}
                  {source.type === 'KPI' && 'KPI定義データを参照します'}
                  {source.type === 'METRIC' && '指標マスタデータを参照します'}
                </p>
              </div>

              {/* Reference ID */}
              <div className="space-y-2">
                <Label htmlFor={`source-ref-${index}`} className="text-xs text-neutral-600">
                  参照ID
                </Label>
                <Input
                  id={`source-ref-${index}`}
                  value={source.refId}
                  onChange={(e) =>
                    handleUpdate(index, { refId: e.target.value })
                  }
                  placeholder={
                    source.type === 'FACT'
                      ? '例: 10001 (売上高)'
                      : source.type === 'KPI'
                      ? '例: kpi-001'
                      : '例: metric-001'
                  }
                />
                <p className="text-xs text-neutral-500">
                  {source.type === 'FACT' && '勘定科目コードを入力'}
                  {source.type === 'KPI' && 'KPI定義IDを入力'}
                  {source.type === 'METRIC' && '指標マスタIDを入力'}
                </p>
              </div>

              {/* Label (for legend) */}
              <div className="space-y-2">
                <Label htmlFor={`source-label-${index}`} className="text-xs text-neutral-600">
                  ラベル（凡例名）
                </Label>
                <Input
                  id={`source-label-${index}`}
                  value={source.label || ''}
                  onChange={(e) =>
                    handleUpdate(index, { label: e.target.value })
                  }
                  placeholder="チャート凡例に表示される名前"
                />
                <p className="text-xs text-neutral-500">
                  グラフや表の凡例として表示されます
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {dataSources.length > 0 && (
        <div className="rounded-md bg-neutral-50 p-2 text-xs text-neutral-600">
          設定済みデータソース数: {dataSources.length}
        </div>
      )}
    </div>
  );
}
