'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { Checkbox } from '@/shared/ui/checkbox';
import { ArrowLeft, Plus, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { HttpBffClient } from '../api/http-bff-client';
import { CreateKpiItemDialog } from './dialogs/create-kpi-item-dialog';
import { KpiItemPanel } from './kpi-item-panel';
import type {
  KpiMasterEventDetailDto,
  KpiMasterItemDetailDto,
} from '@epm-sdd/contracts/bff/kpi-master';

const bffClient = new HttpBffClient();

interface KpiDetailPageProps {
  eventId: string;
}

export function KpiDetailPage({ eventId }: KpiDetailPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<KpiMasterEventDetailDto | null>(null);
  const [items, setItems] = useState<KpiMasterItemDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [showAllDepartments, setShowAllDepartments] = useState(true);

  const loadEventDetail = async () => {
    setLoading(true);
    try {
      const eventDetail = await bffClient.getEventById(eventId);
      setEvent(eventDetail);
      setItems(eventDetail.items);
    } catch (error) {
      console.error('Failed to load event detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetail();
  }, [eventId]);

  // Get unique departments from KPI items
  const departments = Array.from(
    new Set(
      items
        .map((item) => item.departmentStableId)
        .filter((id): id is string => id !== undefined && id !== null),
    ),
  );

  // Filter items by selected departments
  const filteredItems = showAllDepartments
    ? items
    : items.filter(
        (item) =>
          !item.departmentStableId || selectedDepartments.has(item.departmentStableId),
      );

  // Group items by hierarchy
  const level1Items = filteredItems.filter((item) => item.hierarchyLevel === 1);

  const getChildItems = (parentId: string) =>
    filteredItems.filter((item) => item.parentKpiItemId === parentId);

  const handleItemCreated = () => {
    setCreateItemDialogOpen(false);
    loadEventDetail();
  };

  const getKpiTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return <TrendingUp className="w-4 h-4" />;
      case 'NON_FINANCIAL':
        return <Target className="w-4 h-4" />;
      case 'METRIC':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getKpiTypeName = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return '財務科目';
      case 'NON_FINANCIAL':
        return '非財務KPI';
      case 'METRIC':
        return '指標';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-muted-foreground mb-4">イベントが見つかりません</p>
        <Button variant="outline" onClick={() => router.back()}>
          戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {event.eventName}
                </h1>
                {event.status === 'DRAFT' ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    下書き
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    確定済み
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {event.fiscalYear}年度 / {event.eventCode}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCreateItemDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            KPI項目追加
          </Button>
        </div>
      </div>

      {/* Filters */}
      {departments.length > 0 && (
        <div className="flex-none border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-foreground">部門フィルタ:</span>
            <div className="flex items-center gap-2">
              <Checkbox
                id="all-departments"
                checked={showAllDepartments}
                onCheckedChange={(checked) => {
                  setShowAllDepartments(!!checked);
                  if (checked) {
                    setSelectedDepartments(new Set());
                  }
                }}
              />
              <label
                htmlFor="all-departments"
                className="text-sm text-foreground cursor-pointer"
              >
                全部門表示
              </label>
            </div>
            {!showAllDepartments &&
              departments.map((deptId) => {
                const item = items.find((i) => i.departmentStableId === deptId);
                return (
                  <div key={deptId} className="flex items-center gap-2">
                    <Checkbox
                      id={`dept-${deptId}`}
                      checked={selectedDepartments.has(deptId)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedDepartments);
                        if (checked) {
                          newSet.add(deptId);
                        } else {
                          newSet.delete(deptId);
                        }
                        setSelectedDepartments(newSet);
                      }}
                    />
                    <label
                      htmlFor={`dept-${deptId}`}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {item?.departmentName || deptId}
                    </label>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* KPI Items List */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {level1Items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-2">KPI項目がまだ登録されていません</p>
            <Button
              variant="outline"
              onClick={() => setCreateItemDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初のKPI項目を追加
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-6xl mx-auto">
            <Accordion type="multiple" className="space-y-4">
              {level1Items.map((item) => {
                const childItems = getChildItems(item.id);
                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-lg bg-card shadow-sm"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 rounded-t-lg transition-colors">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          {getKpiTypeIcon(item.kpiType)}
                          <Badge
                            variant="outline"
                            className="font-normal bg-secondary/10 text-secondary border-secondary/20"
                          >
                            {getKpiTypeName(item.kpiType)}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{item.kpiName}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            コード: {item.kpiCode}
                            {item.ownerName && ` / 責任者: ${item.ownerName}`}
                          </div>
                        </div>
                        {item.actionPlans && item.actionPlans.length > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            AP: {item.actionPlans.length}件
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <KpiItemPanel item={item} onItemUpdated={loadEventDetail} />

                      {/* Level 2 child items */}
                      {childItems.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="text-sm font-medium text-foreground mb-4">
                            下位KPI項目 ({childItems.length})
                          </h4>
                          <Accordion type="multiple" className="space-y-3">
                            {childItems.map((childItem) => (
                              <AccordionItem
                                key={childItem.id}
                                value={childItem.id}
                                className="border rounded-lg bg-muted/30"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg transition-colors">
                                  <div className="flex items-center gap-3 flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      {getKpiTypeIcon(childItem.kpiType)}
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-normal bg-secondary/10 text-secondary border-secondary/20"
                                      >
                                        {getKpiTypeName(childItem.kpiType)}
                                      </Badge>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-foreground">
                                        {childItem.kpiName}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        コード: {childItem.kpiCode}
                                        {childItem.departmentName &&
                                          ` / 部門: ${childItem.departmentName}`}
                                        {childItem.ownerName &&
                                          ` / 責任者: ${childItem.ownerName}`}
                                      </div>
                                    </div>
                                    {childItem.actionPlans &&
                                      childItem.actionPlans.length > 0 && (
                                        <Badge variant="outline" className="ml-auto text-xs">
                                          AP: {childItem.actionPlans.length}件
                                        </Badge>
                                      )}
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-3">
                                  <KpiItemPanel item={childItem} onItemUpdated={loadEventDetail} />
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>

      {/* Create KPI Item Dialog */}
      <CreateKpiItemDialog
        open={createItemDialogOpen}
        onOpenChange={setCreateItemDialogOpen}
        eventId={eventId}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
