/**
 * Widget Settings Panel
 *
 * Purpose:
 * - Show widget settings in a side panel when widget is selected
 * - Allow editing title, data sources, display settings
 * - Support global filter override
 * - Provide real-time preview updates
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 3, 5)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 12.2)
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { X } from 'lucide-react';
import { DataSourceSelector } from './DataSourceSelector';
import type {
  BffWidgetDto,
  WidgetDisplayConfig,
  DataSource,
} from '@epm/contracts/bff/dashboard';

interface WidgetSettingsPanelProps {
  widget: BffWidgetDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (widget: BffWidgetDto) => void;
}

/**
 * Widget Settings Panel Component
 * Side panel for editing widget configuration
 */
export function WidgetSettingsPanel({
  widget,
  open,
  onOpenChange,
  onUpdate,
}: WidgetSettingsPanelProps) {
  // Local state for editing
  const [title, setTitle] = useState('');
  const [useGlobalFilter, setUseGlobalFilter] = useState(true);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [displayConfig, setDisplayConfig] = useState<WidgetDisplayConfig>({});

  // Initialize from widget when opened
  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setUseGlobalFilter(widget.filterConfig.useGlobal);
      setDataSources(widget.dataConfig.sources);
      setDisplayConfig(widget.displayConfig);
    }
  }, [widget]);

  // Handle save changes
  const handleSave = () => {
    if (!widget) return;

    const updatedWidget: BffWidgetDto = {
      ...widget,
      title,
      filterConfig: {
        ...widget.filterConfig,
        useGlobal: useGlobalFilter,
      },
      dataConfig: {
        sources: dataSources,
      },
      displayConfig,
    };

    onUpdate(updatedWidget);
    onOpenChange(false);
  };


  if (!widget) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-neutral-900">
            ウィジェット設定
          </SheetTitle>
          <SheetDescription className="text-sm text-neutral-600">
            {widget.widgetType}の詳細設定
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Tabs for different settings */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本</TabsTrigger>
              <TabsTrigger value="data">データ</TabsTrigger>
              <TabsTrigger value="display">表示</TabsTrigger>
            </TabsList>

            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="widget-title">タイトル</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ウィジェットタイトル"
                />
              </div>

              {/* Global Filter Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="use-global-filter" className="text-sm font-medium">
                      グローバルフィルターを使用
                    </Label>
                    <p className="text-xs text-neutral-500">
                      ダッシュボード全体のフィルター設定を適用
                    </p>
                  </div>
                  <Switch
                    id="use-global-filter"
                    checked={useGlobalFilter}
                    onCheckedChange={setUseGlobalFilter}
                  />
                </div>
              </div>

              {/* Filter Override (when global filter is off) */}
              {!useGlobalFilter && (
                <div className="rounded-md bg-neutral-50 p-4">
                  <p className="text-sm text-neutral-700 mb-3">
                    個別フィルター設定
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-600">年度</Label>
                      <Select defaultValue="2024">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024年度</SelectItem>
                          <SelectItem value="2023">2023年度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-600">シナリオ</Label>
                      <Select defaultValue="BUDGET">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUDGET">予算</SelectItem>
                          <SelectItem value="FORECAST">予測</SelectItem>
                          <SelectItem value="ACTUAL">実績</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Data Sources Tab */}
            <TabsContent value="data" className="space-y-4">
              <DataSourceSelector
                dataSources={dataSources}
                onChange={setDataSources}
              />
            </TabsContent>

            {/* Display Settings Tab */}
            <TabsContent value="display" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">表示オプション</Label>

                {/* Widget-specific display options */}
                {widget.widgetType === 'KPI_CARD' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                      <Label className="text-sm">スパークライン表示</Label>
                      <Switch
                        checked={(displayConfig as any)?.showSparkline ?? true}
                        onCheckedChange={(checked) =>
                          setDisplayConfig({ ...displayConfig, showSparkline: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                      <Label className="text-sm">比較表示</Label>
                      <Switch
                        checked={(displayConfig as any)?.showCompare ?? true}
                        onCheckedChange={(checked) =>
                          setDisplayConfig({ ...displayConfig, showCompare: checked })
                        }
                      />
                    </div>
                  </div>
                )}

                {(widget.widgetType === 'LINE_CHART' ||
                  widget.widgetType === 'BAR_CHART' ||
                  widget.widgetType === 'PIE_CHART') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                      <Label className="text-sm">凡例表示</Label>
                      <Switch
                        checked={(displayConfig as any)?.showLegend ?? true}
                        onCheckedChange={(checked) =>
                          setDisplayConfig({ ...displayConfig, showLegend: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                      <Label className="text-sm">データラベル表示</Label>
                      <Switch
                        checked={(displayConfig as any)?.showDataLabels ?? false}
                        onCheckedChange={(checked) =>
                          setDisplayConfig({ ...displayConfig, showDataLabels: checked })
                        }
                      />
                    </div>
                  </div>
                )}

                {widget.widgetType === 'TABLE' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                      <Label className="text-sm">比較列表示</Label>
                      <Switch
                        checked={(displayConfig as any)?.showCompareColumns ?? false}
                        onCheckedChange={(checked) =>
                          setDisplayConfig({ ...displayConfig, showCompareColumns: checked })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-2 border-t border-neutral-200 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            適用
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
