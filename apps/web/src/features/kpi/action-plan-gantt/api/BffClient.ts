/**
 * KPI Action Plan Gantt - BFF Client Interface
 *
 * design.md準拠: BFF Endpoints
 */

import type {
  BffGanttData,
  BffGanttWbs,
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  BffNextWbsCodeResponse,
  BffSelectableDepartment,
  BffSelectableEmployee,
} from '../lib/types'

export interface BffClient {
  // === ガントチャートデータ ===

  /**
   * ガントデータ取得
   * GET /api/bff/action-plan/gantt/:planId
   */
  getGanttData(planId: string): Promise<BffGanttData>

  // === WBS CRUD ===

  /**
   * WBS作成
   * POST /api/bff/action-plan/gantt/wbs
   */
  createWbs(request: BffCreateWbsRequest): Promise<BffGanttWbs>

  /**
   * WBS編集
   * PATCH /api/bff/action-plan/gantt/wbs/:id
   */
  updateWbs(wbsId: string, request: BffUpdateWbsRequest): Promise<BffGanttWbs>

  /**
   * WBS削除
   * DELETE /api/bff/action-plan/gantt/wbs/:id
   */
  deleteWbs(wbsId: string): Promise<void>

  // === スケジュール・進捗・依存関係 ===

  /**
   * スケジュール更新
   * PATCH /api/bff/action-plan/gantt/wbs/:id/schedule
   */
  updateWbsSchedule(wbsId: string, request: BffUpdateWbsScheduleRequest): Promise<void>

  /**
   * 進捗率更新
   * PATCH /api/bff/action-plan/gantt/wbs/:id/progress
   */
  updateWbsProgress(wbsId: string, request: BffUpdateWbsProgressRequest): Promise<void>

  /**
   * 依存関係更新
   * PATCH /api/bff/action-plan/gantt/wbs/:id/dependency
   */
  updateWbsDependency(wbsId: string, request: BffUpdateWbsDependencyRequest): Promise<void>

  // === ユーティリティ ===

  /**
   * 次のWBSコード取得
   * GET /api/bff/action-plan/gantt/wbs/:id/next-code
   */
  getNextWbsCode(parentWbsId: string | null, planId: string): Promise<BffNextWbsCodeResponse>

  // === 選択可能データ ===

  /**
   * 選択可能部門一覧
   */
  getSelectableDepartments(): Promise<BffSelectableDepartment[]>

  /**
   * 選択可能社員一覧
   */
  getSelectableEmployees(): Promise<BffSelectableEmployee[]>
}
