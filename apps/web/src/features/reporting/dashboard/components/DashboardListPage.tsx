/**
 * Dashboard List Page
 *
 * Purpose:
 * - Display list of dashboards with pagination, sorting, and search
 * - Navigate to dashboard detail view on selection
 * - Show create button for users with manage permission
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 1)
 * - .kiro/steering/epm-design-system.md (Design System)
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@/shared/ui';
import { Search, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDashboards } from '../hooks/useDashboards';
import { CreateDashboardDialog } from './CreateDashboardDialog';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Dashboard List Page Component
 * Displays all dashboards the user has access to
 */
export function DashboardListPage() {
  const router = useRouter();
  const {
    dashboards,
    total,
    loading,
    error,
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword,
    setPage,
    setKeyword,
    handleSort,
    refetch,
  } = useDashboards();

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Handle row click - navigate to dashboard detail
  const handleRowClick = (dashboardId: string) => {
    router.push(`/reporting/dashboards/${dashboardId}`);
  };

  // Handle create button - open dialog
  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  // Handle successful dashboard creation
  const handleCreateSuccess = () => {
    refetch();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ja,
      });
    } catch {
      return dateString;
    }
  };

  // Sort indicator
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            ダッシュボード
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            経営指標を可視化するダッシュボードを管理します
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="ダッシュボード名・説明で検索..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-error-50 p-4">
          <p className="text-sm text-error-700">
            ダッシュボードの取得に失敗しました: {error.message}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead
                className="cursor-pointer select-none hover:bg-neutral-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-neutral-700">ダッシュボード名</span>
                  {getSortIcon('name') && (
                    <span className="text-primary-600">{getSortIcon('name')}</span>
                  )}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-neutral-700">説明</TableHead>
              <TableHead className="font-semibold text-neutral-700">種別</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-neutral-100"
                onClick={() => handleSort('updatedAt')}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-neutral-700">最終更新</span>
                  {getSortIcon('updatedAt') && (
                    <span className="text-primary-600">{getSortIcon('updatedAt')}</span>
                  )}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-neutral-700">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : dashboards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                  {keyword
                    ? '検索条件に一致するダッシュボードが見つかりませんでした'
                    : 'ダッシュボードがまだありません'}
                </TableCell>
              </TableRow>
            ) : (
              dashboards.map((dashboard) => (
                <TableRow
                  key={dashboard.id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => handleRowClick(dashboard.id)}
                >
                  <TableCell className="font-medium text-neutral-900">
                    {dashboard.name}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {dashboard.description || '-'}
                  </TableCell>
                  <TableCell>
                    {dashboard.ownerType === 'SYSTEM' ? (
                      <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
                        システム
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-neutral-700">
                        ユーザー
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {formatDate(dashboard.updatedAt)}
                  </TableCell>
                  <TableCell>
                    {dashboard.isActive ? (
                      <Badge variant="default" className="bg-success-100 text-success-700">
                        有効
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-neutral-500">
                        無効
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && dashboards.length > 0 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3">
          <div className="text-sm text-neutral-600">
            {total}件中 {(page - 1) * pageSize + 1}〜
            {Math.min(page * pageSize, total)}件を表示
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dashboard Dialog */}
      <CreateDashboardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
