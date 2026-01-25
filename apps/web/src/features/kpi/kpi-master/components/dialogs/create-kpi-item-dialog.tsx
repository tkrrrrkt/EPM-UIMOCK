'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { HttpBffClient } from '../../api/http-bff-client';

const bffClient = new HttpBffClient();

interface CreateKpiItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onItemCreated: () => void;
}

type KpiType = 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';

export function CreateKpiItemDialog({
  open,
  onOpenChange,
  eventId,
  onItemCreated,
}: CreateKpiItemDialogProps) {
  const [step, setStep] = useState<'type' | 'details'>(type');
  const [kpiType, setKpiType] = useState<KpiType>('FINANCIAL');
  const [kpiCode, setKpiCode] = useState('');
  const [kpiName, setKpiName] = useState('');
  const [hierarchyLevel, setHierarchyLevel] = useState<number>(1);
  const [refSubjectId, setRefSubjectId] = useState('');
  const [refKpiDefinitionId, setRefKpiDefinitionId] = useState('');
  const [refMetricId, setRefMetricId] = useState('');
  const [loading, setLoading] = useState(false);

  // Selectable options
  const [subjects, setSubjects] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [kpiDefinitions, setKpiDefinitions] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadSelectableOptions();
    }
  }, [open]);

  const loadSelectableOptions = async () => {
    try {
      const [subjectsData, metricsData, definitionsData] = await Promise.all([
        bffClient.getSelectableSubjects('company-001'),
        bffClient.getSelectableMetrics('company-001'),
        bffClient.getKpiDefinitions({ companyId: 'company-001', page: 1, pageSize: 100 }),
      ]);
      setSubjects(subjectsData.subjects);
      setMetrics(metricsData.metrics);
      setKpiDefinitions(definitionsData.definitions);
    } catch (error) {
      console.error('Failed to load selectable options:', error);
    }
  };

  const handleTypeSelect = (type: KpiType) => {
    setKpiType(type);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kpiCode || !kpiName) {
      alert('すべての必須項目を入力してください');
      return;
    }

    // Validate type-specific references
    if (kpiType === 'FINANCIAL' && !refSubjectId) {
      alert('財務科目を選択してください');
      return;
    }
    if (kpiType === 'NON_FINANCIAL' && !refKpiDefinitionId) {
      alert('非財務KPI定義を選択してください');
      return;
    }
    if (kpiType === 'METRIC' && !refMetricId) {
      alert('指標を選択してください');
      return;
    }

    setLoading(true);
    try {
      await bffClient.createItem({
        kpiEventId: eventId,
        parentKpiItemId: undefined,
        kpiCode,
        kpiName,
        kpiType,
        hierarchyLevel,
        refSubjectId: kpiType === 'FINANCIAL' ? refSubjectId : undefined,
        refKpiDefinitionId: kpiType === 'NON_FINANCIAL' ? refKpiDefinitionId : undefined,
        refMetricId: kpiType === 'METRIC' ? refMetricId : undefined,
        departmentStableId: undefined,
        ownerEmployeeId: 'emp-001', // TODO: Get from context
        sortOrder: 0,
      });

      // Reset form
      resetForm();
      onItemCreated();
    } catch (error) {
      console.error('Failed to create KPI item:', error);
      alert('KPI項目の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setKpiType('FINANCIAL');
    setKpiCode('');
    setKpiName('');
    setHierarchyLevel(1);
    setRefSubjectId('');
    setRefKpiDefinitionId('');
    setRefMetricId('');
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
    } else {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'KPI種別選択' : 'KPI項目詳細入力'}
          </DialogTitle>
          <DialogDescription>
            {step === 'type'
              ? 'KPI項目の種別を選択してください'
              : 'KPI項目の詳細情報を入力してください'}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' ? (
          <div className="py-6">
            <RadioGroup value={kpiType} onValueChange={(value) => setKpiType(value as KpiType)}>
              <div className="space-y-3">
                {/* Financial KPI */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    kpiType === 'FINANCIAL'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleTypeSelect('FINANCIAL')}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="FINANCIAL" id="financial" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <Label htmlFor="financial" className="text-base font-medium cursor-pointer">
                          財務科目KPI
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        財務会計科目（売上高、営業利益など）を基にしたKPIです。科目マスタから選択します。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Non-Financial KPI */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    kpiType === 'NON_FINANCIAL'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleTypeSelect('NON_FINANCIAL')}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="NON_FINANCIAL" id="non-financial" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-secondary" />
                        <Label
                          htmlFor="non-financial"
                          className="text-base font-medium cursor-pointer"
                        >
                          非財務KPI
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        顧客満足度、従業員満足度など、手動入力で管理するKPIです。KPI定義マスタから選択または新規作成します。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metric KPI */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    kpiType === 'METRIC'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => handleTypeSelect('METRIC')}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="METRIC" id="metric" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-info" />
                        <Label htmlFor="metric" className="text-base font-medium cursor-pointer">
                          指標KPI
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        市場シェア、稼働率など、計算式で算出される指標です。指標マスタから選択します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Reference Selection */}
              <div className="space-y-2">
                <Label>
                  {kpiType === 'FINANCIAL' && '財務科目'}
                  {kpiType === 'NON_FINANCIAL' && '非財務KPI定義'}
                  {kpiType === 'METRIC' && '指標'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                {kpiType === 'FINANCIAL' && (
                  <Select value={refSubjectId} onValueChange={setRefSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subjectCode} - {subject.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {kpiType === 'NON_FINANCIAL' && (
                  <Select value={refKpiDefinitionId} onValueChange={setRefKpiDefinitionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="KPI定義を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpiDefinitions.map((def) => (
                        <SelectItem key={def.id} value={def.id}>
                          {def.kpiCode} - {def.kpiName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {kpiType === 'METRIC' && (
                  <Select value={refMetricId} onValueChange={setRefMetricId}>
                    <SelectTrigger>
                      <SelectValue placeholder="指標を選択" />
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

              {/* KPI Code */}
              <div className="space-y-2">
                <Label htmlFor="kpiCode">
                  KPIコード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpiCode"
                  value={kpiCode}
                  onChange={(e) => setKpiCode(e.target.value)}
                  placeholder="例: KPI-001"
                  className="font-mono"
                  maxLength={20}
                  required
                />
              </div>

              {/* KPI Name */}
              <div className="space-y-2">
                <Label htmlFor="kpiName">
                  KPI名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpiName"
                  value={kpiName}
                  onChange={(e) => setKpiName(e.target.value)}
                  placeholder="例: 売上高"
                  maxLength={100}
                  required
                />
              </div>

              {/* Hierarchy Level */}
              <div className="space-y-2">
                <Label htmlFor="hierarchyLevel">
                  階層レベル <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={hierarchyLevel.toString()}
                  onValueChange={(value) => setHierarchyLevel(Number(value))}
                >
                  <SelectTrigger id="hierarchyLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1（全社レベル）</SelectItem>
                    <SelectItem value="2">Level 2（事業部レベル）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                戻る
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary">
                {loading ? '作成中...' : '作成'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'type' && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
