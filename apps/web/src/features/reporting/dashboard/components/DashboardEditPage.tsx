/**
 * Dashboard Edit Page
 *
 * Purpose:
 * - Provide edit mode for dashboard layout and widgets
 * - Support drag & drop and resize using SyncFusion Dashboard Layout
 * - Allow adding/removing widgets
 * - Save/cancel changes
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 3)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 12.1)
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import { Save, X, Plus, ArrowLeft, Loader2, Settings } from 'lucide-react';
import { DashboardLayoutComponent } from '@syncfusion/ej2-react-layouts';
import { useDashboard } from '../hooks/useDashboard';
import { WidgetSettingsPanel } from './WidgetSettingsPanel';
import { bffClient } from '../api/client';
import type {
  BffUpdateDashboardDto,
  BffWidgetDto,
  BffUpdateWidgetDto,
  WidgetType,
} from '@epm/contracts/bff/dashboard';

interface DashboardEditPageProps {
  dashboardId: string;
}

/**
 * Dashboard Edit Page Component
 * Enables drag & drop layout editing with SyncFusion Dashboard Layout
 */
export function DashboardEditPage({ dashboardId }: DashboardEditPageProps) {
  const router = useRouter();
  const dashboardLayoutRef = useRef<DashboardLayoutComponent>(null);
  const { dashboard, loading, error } = useDashboard(dashboardId);

  // Edit state
  const [widgets, setWidgets] = useState<BffWidgetDto[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<BffWidgetDto | null>(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Initialize widgets from dashboard
  useEffect(() => {
    if (dashboard?.widgets) {
      setWidgets(dashboard.widgets);
    }
  }, [dashboard]);

  // Handle widget remove
  const handleRemoveWidget = useCallback((widgetId: string) => {
    const confirmed = window.confirm('このウィジェットを削除しますか?');
    if (!confirmed) return;

    setWidgets(widgets.filter((w) => w.id !== widgetId));
    setHasChanges(true);
  }, [widgets]);

  // Handle widget update from settings panel
  const handleUpdateWidget = useCallback((updatedWidget: BffWidgetDto) => {
    setWidgets(widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)));
    setHasChanges(true);
  }, [widgets]);

  // Handle widget select (for settings panel)
  const handleSelectWidget = useCallback((widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    if (widget) {
      setSelectedWidget(widget);
      setShowSettingsPanel(true);
    }
  }, [widgets]);

  // Handle widget button clicks (remove, settings)
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle remove button
      if (target.classList.contains('widget-remove')) {
        const widgetId = target.getAttribute('data-id');
        if (widgetId) {
          handleRemoveWidget(widgetId);
        }
      }

      // Handle settings button
      if (target.classList.contains('widget-settings')) {
        const widgetId = target.getAttribute('data-id');
        if (widgetId) {
          handleSelectWidget(widgetId);
        }
      }
    };

    document.addEventListener('click', handleButtonClick);
    return () => document.removeEventListener('click', handleButtonClick);
  }, [widgets, handleRemoveWidget, handleSelectWidget]);

  // Handle back navigation with unsaved changes warning
  const handleBack = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        '未保存の変更があります。破棄して戻りますか?'
      );
      if (!confirmed) return;
    }
    router.push(`/reporting/dashboards/${dashboardId}`);
  }, [router, dashboardId, hasChanges]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!dashboardLayoutRef.current) return;

    setSaving(true);
    try {
      // Serialize current layout from SyncFusion Dashboard Layout
      const serializedPanels = dashboardLayoutRef.current.serialize() as Array<{
        id: string;
        row: number;
        col: number;
        sizeX: number;
        sizeY: number;
      }>;

      // Map serialized panels back to widget DTOs
      const updatedWidgets: BffUpdateWidgetDto[] = widgets.map((widget, index) => {
        const panel = serializedPanels[index];
        return {
          id: widget.id,
          widgetType: widget.widgetType,
          title: widget.title,
          layout: {
            row: panel?.row ?? widget.layout.row,
            col: panel?.col ?? widget.layout.col,
            sizeX: panel?.sizeX ?? widget.layout.sizeX,
            sizeY: panel?.sizeY ?? widget.layout.sizeY,
          },
          dataConfig: widget.dataConfig,
          filterConfig: widget.filterConfig,
          displayConfig: widget.displayConfig,
          sortOrder: index,
        };
      });

      // Update dashboard via BFF
      const updateData: BffUpdateDashboardDto = {
        widgets: updatedWidgets,
      };

      await bffClient.updateDashboard(dashboardId, updateData);

      setHasChanges(false);
      router.push(`/reporting/dashboards/${dashboardId}`);
    } catch (err) {
      console.error('Failed to save dashboard:', err);
      alert('保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'));
    } finally {
      setSaving(false);
    }
  }, [dashboardId, widgets, router]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm(
        '未保存の変更があります。破棄しますか?'
      );
      if (!confirmed) return;
    }
    router.push(`/reporting/dashboards/${dashboardId}`);
  }, [router, dashboardId, hasChanges]);

  // Handle widget add
  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    // Create new widget with default settings
    const newWidget: BffWidgetDto = {
      id: `temp-${Date.now()}`, // Temporary ID
      widgetType,
      title: `新規${widgetType}`,
      layout: {
        row: 0,
        col: 0,
        sizeX: 2,
        sizeY: 2,
      },
      dataConfig: {
        sources: [],
      },
      filterConfig: {
        useGlobal: true,
      },
      displayConfig: {},
      sortOrder: widgets.length,
    };

    setWidgets([...widgets, newWidget]);
    setHasChanges(true);
    setShowWidgetSelector(false);
  }, [widgets]);

  // Handle layout change (drag/resize)
  const handleChange = useCallback(() => {
    setHasChanges(true);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-neutral-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-error-600">
            ダッシュボードの読み込みに失敗しました
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {error?.message || 'ダッシュボードが見つかりませんでした'}
          </p>
          <Button onClick={() => router.push('/reporting/dashboards')} variant="outline" className="mt-4">
            一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  // Convert widgets to SyncFusion panel format
  const panels = widgets.map((widget) => ({
    id: widget.id,
    row: widget.layout.row,
    col: widget.layout.col,
    sizeX: widget.layout.sizeX,
    sizeY: widget.layout.sizeY,
    content: `<div class="widget-content">
      <div class="widget-header">
        <h3>${widget.title}</h3>
        <div class="widget-actions">
          <button class="widget-settings" data-id="${widget.id}" title="設定">⚙</button>
          <button class="widget-remove" data-id="${widget.id}" title="削除">×</button>
        </div>
      </div>
      <div class="widget-body">
        <p>Type: ${widget.widgetType}</p>
        <p>ドラッグ&リサイズで配置を調整</p>
        <p class="text-xs text-neutral-400 mt-2">⚙をクリックして設定</p>
      </div>
    </div>`,
  }));

  return (
    <div className="flex h-full flex-col p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              {dashboard.name} - 編集モード
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              ウィジェットをドラッグ&ドロップで配置できます
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWidgetSelector(!showWidgetSelector)}
          >
            <Plus className="mr-2 h-4 w-4" />
            ウィジェット追加
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="mr-2 h-4 w-4" />
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Widget Type Selector Panel */}
      {showWidgetSelector && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            ウィジェット種別を選択
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {(['KPI_CARD', 'LINE_CHART', 'BAR_CHART', 'PIE_CHART', 'GAUGE', 'TABLE', 'TEXT', 'COMPOSITE_CHART'] as WidgetType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAddWidget(type)}
                className="rounded-md border border-neutral-200 p-3 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <p className="text-sm font-medium text-neutral-900">{type}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Layout (SyncFusion) */}
      <div className="flex-1 overflow-auto">
        {widgets.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-neutral-400">
              <p>ウィジェットがまだ追加されていません</p>
              <Button
                onClick={() => setShowWidgetSelector(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                最初のウィジェットを追加
              </Button>
            </div>
          </div>
        ) : (
          <DashboardLayoutComponent
            ref={dashboardLayoutRef}
            id="dashboard-layout"
            columns={6}
            cellSpacing={[10, 10]}
            allowDragging={true}
            allowResizing={true}
            panels={panels}
            change={handleChange}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm text-neutral-600">
        <div>
          {hasChanges ? (
            <span className="text-warning-600 font-medium">未保存の変更があります</span>
          ) : (
            <span>変更なし</span>
          )}
        </div>
        <div>ウィジェット数: {widgets.length}</div>
      </div>

      {/* Widget Settings Panel */}
      <WidgetSettingsPanel
        widget={selectedWidget}
        open={showSettingsPanel}
        onOpenChange={setShowSettingsPanel}
        onUpdate={handleUpdateWidget}
      />
    </div>
  );
}
