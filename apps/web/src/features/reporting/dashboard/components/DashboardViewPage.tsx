/**
 * Dashboard View Page
 *
 * Purpose:
 * - Display dashboard with widgets in SyncFusion Dashboard Layout
 * - Show global filter panel at top
 * - Support manual refresh
 * - Show edit button for users with manage permission
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 2)
 * - .kiro/steering/epm-design-system.md (Design System)
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import { RefreshCw, Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { GlobalFilterPanel } from './GlobalFilterPanel';
import { WidgetRenderer } from './WidgetRenderer';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { PdfExportButton } from './PdfExportButton';
import type { GlobalFilterConfig } from '@epm/contracts/bff/dashboard';

interface DashboardViewPageProps {
  dashboardId: string;
  canEdit?: boolean; // Permission check (will be implemented later)
}

/**
 * Dashboard View Page Component
 * Displays dashboard with SyncFusion Dashboard Layout integration
 */
export function DashboardViewPage({ dashboardId, canEdit = true }: DashboardViewPageProps) {
  const router = useRouter();
  const { dashboard, loading, error, refetch } = useDashboard(dashboardId);
  const [refreshing, setRefreshing] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize global filter from dashboard config
  useState(() => {
    if (dashboard?.globalFilterConfig) {
      setGlobalFilter(dashboard.globalFilterConfig);
    }
  });

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Handle global filter change
  const handleFilterChange = useCallback((config: GlobalFilterConfig) => {
    setGlobalFilter(config);
    // TODO: Trigger widget data refetch
  }, []);

  // Handle edit mode
  const handleEdit = useCallback(() => {
    router.push(`/reporting/dashboards/${dashboardId}/edit`);
  }, [router, dashboardId]);

  // Handle delete button
  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  // Handle successful deletion
  const handleDeleteSuccess = useCallback(() => {
    router.push('/reporting/dashboards');
  }, [router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/reporting/dashboards');
  }, [router]);

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
          <Button onClick={handleBack} variant="outline" className="mt-4">
            一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-content" className="flex h-full flex-col p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {dashboard.name}
            </h1>
            {dashboard.description && (
              <p className="text-sm text-neutral-600 mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-neutral-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <PdfExportButton
            dashboardName={dashboard.name}
            targetElementId="dashboard-content"
            className="text-neutral-700"
          />
          {canEdit && dashboard.ownerType === 'USER' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-error-600 hover:bg-error-50 hover:text-error-700 border-error-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </Button>
              <Button onClick={handleEdit} className="bg-primary-600 hover:bg-primary-700">
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Global Filter Panel */}
      {globalFilter && (
        <GlobalFilterPanel
          config={globalFilter}
          onChange={handleFilterChange}
          onRefresh={handleRefresh}
        />
      )}

      {/* Dashboard Layout - Simple Grid for now (SyncFusion integration in refinement) */}
      <div className="flex-1 overflow-auto">
        {dashboard.widgets.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-neutral-400">
              <p>ウィジェットがまだ追加されていません</p>
              {canEdit && (
                <Button onClick={handleEdit} variant="outline" className="mt-4">
                  ウィジェットを追加
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4 auto-rows-[200px]">
            {dashboard.widgets.map((widget) => (
              <div
                key={widget.id}
                className={`
                  col-span-${Math.min(widget.layout.sizeX, 6)}
                  row-span-${widget.layout.sizeY}
                `}
                style={{
                  gridColumn: `span ${Math.min(widget.layout.sizeX, 6)} / span ${Math.min(widget.layout.sizeX, 6)}`,
                  gridRow: `span ${widget.layout.sizeY} / span ${widget.layout.sizeY}`,
                }}
              >
                <WidgetRenderer
                  widget={widget}
                  dashboardId={dashboardId}
                  globalFilter={globalFilter}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm text-neutral-600">
        <div>
          最終更新: {new Date(dashboard.updatedAt).toLocaleString('ja-JP')}
        </div>
        <div>
          ウィジェット数: {dashboard.widgets.length}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dashboard={dashboard}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
