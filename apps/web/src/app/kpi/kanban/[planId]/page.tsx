/**
 * KPIアクションプラン カンバンボードページ
 *
 * Route: /kpi/kanban/:planId
 * Feature: apps/web/src/features/kpi/action-plan-kanban/
 *
 * design.md準拠:
 * - Trello準拠のカンバンボード
 * - タスク管理、ドラッグ&ドロップ、チェックリスト、コメント
 */

import KanbanPage from '@/features/kpi/action-plan-kanban/pages/kanban-page'

interface PageProps {
  params: Promise<{ planId: string }>
}

export default async function Page({ params }: PageProps) {
  const { planId } = await params
  return <KanbanPage planId={planId} />
}
