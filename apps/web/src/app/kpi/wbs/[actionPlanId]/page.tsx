/**
 * KPIアクションプラン WBSページ
 *
 * Route: /kpi/wbs/:actionPlanId
 * Feature: apps/web/src/features/kpi/action-plan-gantt/
 *
 * design.md準拠:
 * - WBS階層構造のガントチャート表示
 * - スケジュールのドラッグ編集
 * - 依存関係の可視化
 *
 * Note: ガントチャート機能を使用してWBS管理を実現
 */

import GanttPage from '@/features/kpi/action-plan-gantt/pages/gantt-page'

interface PageProps {
  params: Promise<{ actionPlanId: string }>
}

export default async function Page({ params }: PageProps) {
  const { actionPlanId } = await params
  return <GanttPage planId={actionPlanId} />
}
