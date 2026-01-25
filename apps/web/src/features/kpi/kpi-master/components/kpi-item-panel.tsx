'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Plus, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { HttpBffClient } from '../api/http-bff-client';
import { AddActionPlanDialog } from './dialogs/add-action-plan-dialog';
import type {
  KpiMasterItemDetailDto,
  PeriodFactDto,
} from '@epm-sdd/contracts/bff/kpi-master';

const bffClient = new HttpBffClient();

interface KpiItemPanelProps {
  item: KpiMasterItemDetailDto;
  onItemUpdated?: () => void;
}

interface EditingCell {
  periodCode: string;
  field: 'targetValue' | 'actualValue' | 'notes';
  value: string;
}

export function KpiItemPanel({ item, onItemUpdated }: KpiItemPanelProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [saving, setSaving] = useState(false);
  const [addActionPlanDialogOpen, setAddActionPlanDialogOpen] = useState(false);
  const periodCodes = Object.keys(item.periodFacts || {}).sort();
  const hasPeriodFacts = periodCodes.length > 0;
  const hasActionPlans = item.actionPlans && item.actionPlans.length > 0;

  const formatNumber = (value: number | undefined, decimals = 0): string => {
    if (value === undefined) return '-';
    return value.toLocaleString('ja-JP', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getAchievementRateColor = (rate: number | undefined): string => {
    if (rate === undefined) return '';
    if (rate >= 100) return 'text-success font-medium';
    if (rate >= 80) return 'text-warning font-medium';
    return 'text-destructive font-medium';
  };

  const handleCellClick = (
    periodCode: string,
    field: 'targetValue' | 'actualValue' | 'notes',
    currentValue: any,
  ) => {
    // Only allow editing for non-financial KPIs
    if (item.kpiType !== 'NON_FINANCIAL') return;

    setEditingCell({
      periodCode,
      field,
      value: currentValue?.toString() || '',
    });
  };

  const handleSave = async () => {
    if (!editingCell) return;

    setSaving(true);
    try {
      const fact = item.periodFacts[editingCell.periodCode];
      const updateData: any = {
        targetValue: fact.targetValue,
        actualValue: fact.actualValue,
        notes: fact.notes,
      };

      // Update the specific field
      if (editingCell.field === 'targetValue' || editingCell.field === 'actualValue') {
        updateData[editingCell.field] = parseFloat(editingCell.value) || 0;
      } else {
        updateData[editingCell.field] = editingCell.value;
      }

      // Mock API call to update fact amount
      await bffClient.updateFactAmount('mock-fact-id', updateData);

      setEditingCell(null);
      onItemUpdated?.();
    } catch (error) {
      console.error('Failed to update fact amount:', error);
      alert('予実データの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const renderEditableCell = (
    periodCode: string,
    field: 'targetValue' | 'actualValue' | 'notes',
    value: any,
    isNumeric: boolean,
  ) => {
    const isEditing =
      editingCell?.periodCode === periodCode && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {field === 'notes' ? (
            <Textarea
              value={editingCell.value}
              onChange={(e) =>
                setEditingCell({ ...editingCell, value: e.target.value })
              }
              className="min-h-[60px] text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel();
              }}
            />
          ) : (
            <Input
              type="number"
              step="0.1"
              value={editingCell.value}
              onChange={(e) =>
                setEditingCell({ ...editingCell, value: e.target.value })
              }
              className="w-32 text-right font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={saving}
            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={saving}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    // Non-editing mode
    return (
      <div
        className={`group relative ${item.kpiType === 'NON_FINANCIAL' ? 'cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors' : ''}`}
        onClick={() => handleCellClick(periodCode, field, value)}
      >
        {isNumeric ? (
          <span className="font-mono">
            {formatNumber(value, item.kpiType === 'NON_FINANCIAL' ? 1 : 0)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">{value || '-'}</span>
        )}
        {item.kpiType === 'NON_FINANCIAL' && (
          <Edit2 className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Facts Table */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">予実データ</h4>
        {hasPeriodFacts ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">期間</TableHead>
                  <TableHead className="text-right">目標値</TableHead>
                  <TableHead className="text-right">実績値</TableHead>
                  <TableHead className="text-right">達成率</TableHead>
                  {item.kpiType === 'NON_FINANCIAL' && (
                    <TableHead className="w-64">備考</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodCodes.map((periodCode) => {
                  const fact = item.periodFacts[periodCode];
                  return (
                    <TableRow key={periodCode}>
                      <TableCell className="font-medium">{periodCode}</TableCell>
                      <TableCell className="text-right">
                        {renderEditableCell(
                          periodCode,
                          'targetValue',
                          fact.targetValue,
                          true,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.kpiType === 'METRIC' && !fact.actualValue ? (
                          <span className="text-xs text-muted-foreground italic">
                            自動計算 (Phase 2)
                          </span>
                        ) : (
                          renderEditableCell(
                            periodCode,
                            'actualValue',
                            fact.actualValue,
                            true,
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fact.achievementRate !== undefined ? (
                          <span className={getAchievementRateColor(fact.achievementRate)}>
                            {formatNumber(fact.achievementRate, 1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {item.kpiType === 'NON_FINANCIAL' && (
                        <TableCell>
                          {renderEditableCell(periodCode, 'notes', fact.notes, false)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <p className="text-sm text-muted-foreground">
              予実データがまだ登録されていません
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="w-3 h-3 mr-1" />
              期間追加
            </Button>
          </div>
        )}
      </div>

      {/* Action Plans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">
            アクションプラン ({item.actionPlans?.length || 0})
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddActionPlanDialogOpen(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            アクションプラン追加
          </Button>
        </div>
        {hasActionPlans ? (
          <div className="space-y-2">
            {item.actionPlans.map((plan) => (
              <div
                key={plan.id}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {plan.planName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {plan.planCode}
                      </Badge>
                      {plan.status === 'IN_PROGRESS' && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-info/10 text-info border-info/20"
                        >
                          進行中
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">進捗率:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {plan.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      WBS
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      かんばん
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <p className="text-sm text-muted-foreground">
              アクションプランがまだ登録されていません
            </p>
          </div>
        )}
      </div>

      {/* Add Action Plan Dialog */}
      <AddActionPlanDialog
        open={addActionPlanDialogOpen}
        onOpenChange={setAddActionPlanDialogOpen}
        kpiMasterItemId={item.id}
        kpiItemName={item.kpiName}
        onActionPlanCreated={() => {
          setAddActionPlanDialogOpen(false);
          onItemUpdated?.();
        }}
      />
    </div>
  );
}
