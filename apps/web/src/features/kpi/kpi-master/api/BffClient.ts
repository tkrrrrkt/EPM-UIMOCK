import type {
  BffKpiListResponse,
  BffKpiDetail,
  BffKpiEvent,
  BffKpiItem,
  BffSelectOption,
  BffDepartment,
  BffEmployee,
  BffCreateKpiEventRequest,
  BffCreateKpiItemRequest,
  BffCreateActionPlanRequest,
  BffUpsertKpiFactAmountRequest,
} from '../lib/types'

/**
 * KPI管理マスタ機能のBFFクライアントインターフェース
 *
 * v0-workflow.md準拠:
 * - UIは必ずBFF経由でデータ取得
 * - contracts/bff DTO形状に準拠
 */
export interface BffClient {
  // Events
  getEvents(): Promise<BffKpiEvent[]>
  createEvent(request: BffCreateKpiEventRequest): Promise<BffKpiEvent>

  // KPI List (with summary)
  getKpiList(eventId: string, departmentStableIds?: string[]): Promise<BffKpiListResponse>

  // KPI Detail
  getKpiDetail(kpiItemId: string): Promise<BffKpiDetail>

  // KPI Items
  getKpiItems(eventId: string): Promise<BffKpiItem[]>
  createKpiItem(request: BffCreateKpiItemRequest): Promise<BffKpiItem>
  updateKpiItem(id: string, request: Partial<BffCreateKpiItemRequest>): Promise<BffKpiItem>
  deleteKpiItem(id: string): Promise<void>

  // Fact Amounts
  updateFactAmount(factId: string, targetValue?: number, actualValue?: number): Promise<void>
  createPeriod(kpiItemId: string, periodCode: string, targetValue?: number): Promise<void>

  // Action Plans
  createActionPlan(request: BffCreateActionPlanRequest): Promise<void>

  // Selectable Options
  getSelectableSubjects(): Promise<BffSelectOption[]>
  getSelectableKpiDefinitions(): Promise<BffSelectOption[]>
  getSelectableMetrics(): Promise<BffSelectOption[]>
  getDepartments(): Promise<BffDepartment[]>
  getEmployees(): Promise<BffEmployee[]>
}
