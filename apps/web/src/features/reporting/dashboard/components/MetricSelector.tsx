'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@/shared/ui';
import { bffClient } from '../api/client';
import type { BffMetricSelectorOption } from '@epm/contracts/bff/dashboard';

interface MetricSelectorProps {
  value?: string;
  onChange: (id: string, option: BffMetricSelectorOption) => void;
  disabled?: boolean;
}

export function MetricSelector({ value, onChange, disabled }: MetricSelectorProps) {
  const [metrics, setMetrics] = useState<BffMetricSelectorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await bffClient.getMetricSelectors();
        setMetrics(response.items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const handleChange = (id: string) => {
    const selected = metrics.find((m) => m.id === id);
    if (selected) {
      onChange(id, selected);
    }
  };

  const selectedMetric = metrics.find((m) => m.id === value);
  const displayValue = selectedMetric
    ? `${selectedMetric.metricCode} - ${selectedMetric.metricName}`
    : undefined;

  return (
    <div className="space-y-1">
      <Label className="text-sm">指標選択</Label>
      {loading && <div className="text-xs text-muted-foreground">読み込み中...</div>}
      {error && <div className="text-xs text-destructive">指標の取得に失敗しました</div>}
      {!loading && !error && (
        <Select value={value} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="指標を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {metrics.map((metric) => (
              <SelectItem key={metric.id} value={metric.id}>
                {metric.metricCode} - {metric.metricName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
