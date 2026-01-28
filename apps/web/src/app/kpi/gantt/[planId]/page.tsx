/**
 * KPIアクションプラン ガントチャートページ
 *
 * Route: /kpi/gantt/:planId
 * Feature: apps/web/src/features/kpi/action-plan-gantt/
 *
 * design.md準拠:
 * - WBS階層構造のガントチャート表示
 * - スケジュールのドラッグ編集
 * - 依存関係の可視化
 */

import GanttPage from '@/features/kpi/action-plan-gantt/pages/gantt-page'

interface PageProps {
  params: Promise<{ planId: string }>
}

export default async function Page({ params }: PageProps) {
  const { planId } = await params
  return <GanttPage planId={planId} />
}
