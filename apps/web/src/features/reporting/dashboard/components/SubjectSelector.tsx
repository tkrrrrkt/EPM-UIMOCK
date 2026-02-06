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
import type { BffSubjectSelectorOption } from '@epm/contracts/bff/dashboard';

interface SubjectSelectorProps {
  value?: string;
  onChange: (stableId: string, option: BffSubjectSelectorOption) => void;
  disabled?: boolean;
}

export function SubjectSelector({ value, onChange, disabled }: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<BffSubjectSelectorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await bffClient.getSubjectSelectors();
        setSubjects(response.items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (stableId: string) => {
    const selected = subjects.find((s) => s.stableId === stableId);
    if (selected) {
      onChange(stableId, selected);
    }
  };

  const selectedSubject = subjects.find((s) => s.stableId === value);
  const displayValue = selectedSubject
    ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`
    : undefined;

  return (
    <div className="space-y-1">
      <Label className="text-sm">科目選択</Label>
      {loading && <div className="text-xs text-muted-foreground">読み込み中...</div>}
      {error && <div className="text-xs text-destructive">科目の取得に失敗しました</div>}
      {!loading && !error && (
        <Select value={value} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="科目を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem
                key={subject.stableId}
                value={subject.stableId}
                className="pl-0"
              >
                <span style={{ marginLeft: `${Math.max(0, (subject.level - 1) * 12)}px` }}>
                  {subject.subjectCode} - {subject.subjectName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
