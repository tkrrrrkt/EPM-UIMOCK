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
 */
'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { bffClient } from '../api/client';
import { SubjectSelector } from './SubjectSelector';
import { MetricSelector } from './MetricSelector';
import type { DataSource, DataSourceType, BffKpiDefinitionOption } from '@epm/contracts/bff/dashboard';

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
  const [kpiOptions, setKpiOptions] = useState<BffKpiDefinitionOption[]>([]);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);

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

  const hasKpiSource = dataSources.some((source) => source.type === 'KPI');

  useEffect(() => {
    if (!hasKpiSource || kpiOptions.length > 0) return;

    let active = true;

    const fetchKpiDefinitions = async () => {
      setKpiLoading(true);
      setKpiError(null);
      try {
        const response = await bffClient.getKpiDefinitions();
        if (active) {
          setKpiOptions(response.items);
        }
      } catch (err) {
        if (active) {
          setKpiError(err instanceof Error ? err.message : 'KPI定義の取得に失敗しました');
        }
      } finally {
        if (active) {
          setKpiLoading(false);
        }
      }
    };

    fetchKpiDefinitions();

    return () => {
      active = false;
    };
  }, [hasKpiSource, kpiOptions.length]);

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
              現在は一部で選択UIに対応しています。未対応の種別は参照IDを直接入力します：
            </p>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>Fact: 勘定科目ツリーから選択</li>
              <li>KPI: KPI定義リストから選択（対応済）</li>
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
                {source.type === 'KPI' ? (
                  <>
                    <Select
                      value={source.refId}
                      onValueChange={(value) => {
                        const selected = kpiOptions.find((opt) => opt.id === value);
                        handleUpdate(index, {
                          refId: value,
                          label: selected?.kpiName || source.label,
                        });
                      }}
                    >
                      <SelectTrigger id={`source-ref-${index}`}>
                        <SelectValue placeholder="KPI定義を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {kpiLoading && (
                          <SelectItem value="__loading__" disabled>
                            読み込み中...
                          </SelectItem>
                        )}
                        {!kpiLoading && kpiOptions.length === 0 && (
                          <SelectItem value="__empty__" disabled>
                            選択可能なKPI定義がありません
                          </SelectItem>
                        )}
                        {kpiOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.kpiCode} - {option.kpiName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {kpiError && (
                      <p className="text-xs text-error-600">{kpiError}</p>
                    )}
                  </>
                ) : source.type === 'FACT' ? (
                  <SubjectSelector
                    value={source.refId}
                    onChange={(stableId, option) => {
                      handleUpdate(index, { refId: stableId });
                      if (!source.label) {
                        handleUpdate(index, {
                          label: `${option.subjectCode} ${option.subjectName}`,
                        });
                      }
                    }}
                  />
                ) : source.type === 'METRIC' ? (
                  <MetricSelector
                    value={source.refId}
                    onChange={(id, option) => {
                      handleUpdate(index, { refId: id });
                      if (!source.label) {
                        handleUpdate(index, {
                          label: `${option.metricCode} ${option.metricName}`,
                        });
                      }
                    }}
                  />
                ) : null}
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
