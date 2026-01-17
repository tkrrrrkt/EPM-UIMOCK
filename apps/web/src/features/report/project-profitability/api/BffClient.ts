/**
 * BffClient Interface: project-profitability (PJ採算照会)
 *
 * SSoT: packages/contracts/src/bff/project-profitability/index.ts
 */

import type {
  BffProjectListRequest,
  BffProjectListResponse,
  BffProjectDetailResponse,
  BffProjectFiltersResponse,
  BffProjectMonthlyTrendResponse,
} from '@epm/contracts/bff/project-profitability'

export interface BffClient {
  /** PJ一覧を取得（サマリ情報付き） */
  listProjects(request: BffProjectListRequest): Promise<BffProjectListResponse>

  /** PJ詳細を取得（主要指標・KPI・直接原価計算指標） */
  getProjectDetail(id: string): Promise<BffProjectDetailResponse>

  /** フィルター選択肢を取得（部門・ステータス） */
  getFilters(): Promise<BffProjectFiltersResponse>

  /** 月別推移を取得 */
  getMonthlyTrend(id: string): Promise<BffProjectMonthlyTrendResponse>
}
