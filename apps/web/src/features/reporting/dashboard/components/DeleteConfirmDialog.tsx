/**
 * Delete Confirm Dialog Component
 *
 * Purpose:
 * - Provide confirmation UI for deleting dashboards
 * - Prevent deletion of system templates
 * - Handle deletion and notify parent on success
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 17)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 14.2)
 */
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/shared/ui';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { bffClient } from '../api/client';
import type { BffDashboardDto } from '@epm/contracts/bff/dashboard';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboard: BffDashboardDto | null;
  onSuccess?: () => void;
}

/**
 * Delete Confirmation Dialog
 * Confirms dashboard deletion and handles system template protection
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  dashboard,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if dashboard is a system template
  const isSystemTemplate = dashboard?.ownerType === 'SYSTEM';

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!dashboard) return;

    // Prevent deletion of system templates
    if (isSystemTemplate) {
      setError(new Error('システムテンプレートは削除できません'));
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await bffClient.deleteDashboard(dashboard.id);

      // Notify parent and close dialog
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete dashboard'));
    } finally {
      setDeleting(false);
    }
  };

  // Handle dialog close - reset error state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  if (!dashboard) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start space-x-3">
            <div className="rounded-full bg-error-100 p-2">
              <AlertTriangle className="h-5 w-5 text-error-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-neutral-900">
                ダッシュボードを削除
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-neutral-600">
                この操作は取り消せません
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dashboard Info */}
          <div className="rounded-md bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-900">{dashboard.name}</p>
            {dashboard.description && (
              <p className="mt-1 text-xs text-neutral-600">{dashboard.description}</p>
            )}
          </div>

          {/* System Template Warning */}
          {isSystemTemplate && (
            <div className="flex items-start space-x-2 rounded-md bg-error-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-error-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error-900">
                  システムテンプレートは削除できません
                </p>
                <p className="mt-1 text-xs text-error-700">
                  このダッシュボードはシステムが提供するテンプレートです。削除することはできません。
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {!isSystemTemplate && (
            <p className="text-sm text-neutral-700">
              本当にこのダッシュボードを削除しますか？
              削除すると、このダッシュボードとすべてのウィジェット設定が削除されます。
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-error-50 p-3">
              <p className="text-sm text-error-700">
                削除に失敗しました: {error.message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || isSystemTemplate}
            className="bg-error-600 hover:bg-error-700"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
