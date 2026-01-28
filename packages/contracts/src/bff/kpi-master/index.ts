/**
 * KPI Master BFF Contracts
 *
 * Purpose: UI-optimized DTOs for KPI Management feature
 * Naming: camelCase (UI/BFF layer)
 * Source: .kiro/specs/kpi/kpi-master/design.md
 */

// =============================================================================
// Summary DTOs (Requirement 1: サマリカード表示)
// =============================================================================

/**
 * KPI Master Summary Query DTO
 * GET /api/bff/kpi-master/summary
 */
export interface GetKpiMasterSummaryQueryDto {
  /** KPI管理イベントID */
  eventId: string;
  /** 部門フィルタ（複数選択可） */
  departmentStableIds?: string[];
}

/**
 * KPI Master Summary Response DTO
 * サマリカード4指標
 */
export interface KpiMasterSummaryDto {
  /** 総KPI数 */
  totalKpiCount: number;
  /** 全体達成率（加重平均） */
  avgAchievementRate: number;
  /** 遅延アクションプラン数 */
  delayedActionPlanCount: number;
  /** 要注目数（達成率80%未満のKPI数） */
  attentionRequiredCount: number;
}

// =============================================================================
// Event DTOs (Requirement 5: KPI管理イベントの作成・管理)
// =============================================================================

/**
 * KPI Master Event DTO
 */
export interface KpiMasterEventDto {
  id: string;
  eventCode: string;
  eventName: string;
  fiscalYear: number;
  status: 'DRAFT' | 'CONFIRMED';
  createdAt: string;
  updatedAt: string;
}

/**
 * KPI Master Event List Query DTO
 * GET /api/bff/kpi-master/events
 */
export interface GetKpiMasterEventsQueryDto {
  /** ページ番号（1-based） */
  page?: number;
  /** ページサイズ */
  pageSize?: number;
  /** ソート項目 */
  sortBy?: 'eventCode' | 'eventName' | 'fiscalYear' | 'createdAt';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
  /** キーワード検索（eventCode, eventName） */
  keyword?: string;
  /** 年度フィルタ */
  fiscalYear?: number;
  /** ステータスフィルタ */
  status?: 'DRAFT' | 'CONFIRMED';
}

/**
 * KPI Master Event List Response DTO
 */
export interface KpiMasterEventListDto {
  items: KpiMasterEventDto[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * KPI Master Event Detail DTO
 * GET /api/bff/kpi-master/events/:id
 */
export interface KpiMasterEventDetailDto extends KpiMasterEventDto {
  /** イベント配下のKPI項目一覧 */
  kpiItems: KpiMasterItemDto[];
}

/**
 * Create KPI Master Event DTO
 * POST /api/bff/kpi-master/events
 */
export interface CreateKpiMasterEventDto {
  eventCode: string;
  eventName: string;
  fiscalYear: number;
}

// =============================================================================
// KPI Item DTOs (Requirement 2, 6: KPI階層ツリー、KPI項目の登録)
// =============================================================================

/**
 * KPI Master Item DTO
 */
export interface KpiMasterItemDto {
  id: string;
  eventId: string;
  kpiCode: string;
  kpiName: string;
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  hierarchyLevel: 1 | 2;
  parentKpiItemId?: string;
  departmentStableId?: string;
  departmentName?: string;
  ownerEmployeeId?: string;
  ownerEmployeeName?: string;
  unit?: string;
  achievementRate?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * KPI Master Item Tree Node DTO
 * Hierarchical structure for tree view
 */
export interface KpiMasterItemTreeDto extends KpiMasterItemDto {
  /** 子KPI項目 */
  children: KpiMasterItemTreeDto[];
  /** 紐づくアクションプラン */
  actionPlans: ActionPlanSummaryDto[];
}

/**
 * Action Plan Summary DTO (for tree view)
 */
export interface ActionPlanSummaryDto {
  id: string;
  planName: string;
  departmentStableId?: string;
  departmentName?: string;
  ownerEmployeeId?: string;
  ownerEmployeeName?: string;
  dueDate?: string;
  progressRate: number;
  isDelayed: boolean;
}

/**
 * Get KPI Master Items Query DTO
 * GET /api/bff/kpi-master/items
 */
export interface GetKpiMasterItemsQueryDto {
  /** KPI管理イベントID */
  eventId: string;
  /** 部門フィルタ（複数選択可） */
  departmentStableIds?: string[];
  /** KPI種別フィルタ */
  kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  /** 階層レベルフィルタ */
  hierarchyLevel?: 1 | 2;
}

/**
 * KPI Master Item Detail DTO
 * GET /api/bff/kpi-master/items/:id
 */
export interface KpiMasterItemDetailDto extends KpiMasterItemDto {
  /** 予実データ（期間別） */
  factAmounts: KpiFactAmountDto[];
  /** 紐づくアクションプラン */
  actionPlans: ActionPlanSummaryDto[];
}

/**
 * Create KPI Master Item DTO
 * POST /api/bff/kpi-master/items
 */
export interface CreateKpiMasterItemDto {
  eventId: string;
  kpiCode: string;
  kpiName: string;
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  hierarchyLevel: 1 | 2;
  parentKpiItemId?: string;
  /** 財務科目参照ID（kpiType=FINANCIALの場合） */
  refSubjectId?: string;
  /** 非財務KPI定義参照ID（kpiType=NON_FINANCIALの場合） */
  refKpiDefinitionId?: string;
  /** 指標参照ID（kpiType=METRICの場合） */
  refMetricId?: string;
  departmentStableId?: string;
  ownerEmployeeId?: string;
  unit?: string;
}

/**
 * Update KPI Master Item DTO
 * PATCH /api/bff/kpi-master/items/:id
 */
export interface UpdateKpiMasterItemDto {
  kpiName?: string;
  departmentStableId?: string;
  ownerEmployeeId?: string;
  unit?: string;
  // Note: kpiType, refSubjectId, refKpiDefinitionId, refMetricId are immutable
}

// =============================================================================
// Selectable Options DTOs (Requirement 6: KPI項目の登録)
// =============================================================================

/**
 * Selectable Subject DTO
 * GET /api/bff/kpi-master/selectable-subjects
 */
export interface SelectableSubjectDto {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectType: string;
}

/**
 * Selectable Subject List DTO
 */
export interface SelectableSubjectListDto {
  subjects: SelectableSubjectDto[];
}

/**
 * Selectable Metric DTO
 * GET /api/bff/kpi-master/selectable-metrics
 */
export interface SelectableMetricDto {
  id: string;
  metricCode: string;
  metricName: string;
  formula?: string;
}

/**
 * Selectable Metric List DTO
 */
export interface SelectableMetricListDto {
  metrics: SelectableMetricDto[];
}

// =============================================================================
// KPI Definition DTOs (Requirement 6: 非財務KPI定義)
// =============================================================================

/**
 * KPI Definition DTO
 */
export interface KpiDefinitionDto {
  id: string;
  kpiCode: string;
  kpiName: string;
  description?: string;
  unit?: string;
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: 'higher_is_better' | 'lower_is_better';
  createdAt: string;
  updatedAt: string;
}

/**
 * Get KPI Definitions Query DTO
 * GET /api/bff/kpi-master/kpi-definitions
 */
export interface GetKpiDefinitionsQueryDto {
  /** ページ番号（1-based） */
  page?: number;
  /** ページサイズ */
  pageSize?: number;
  /** キーワード検索（kpiCode, kpiName） */
  keyword?: string;
}

/**
 * KPI Definition List DTO
 */
export interface KpiDefinitionListDto {
  items: KpiDefinitionDto[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Create KPI Definition DTO
 * POST /api/bff/kpi-master/kpi-definitions
 */
export interface CreateKpiDefinitionDto {
  kpiCode: string;
  kpiName: string;
  description?: string;
  unit?: string;
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: 'higher_is_better' | 'lower_is_better';
}

// =============================================================================
// Fact Amount DTOs (Requirement 7: 非財務KPIの目標・実績入力)
// =============================================================================

/**
 * KPI Fact Amount DTO
 */
export interface KpiFactAmountDto {
  id: string;
  kpiMasterItemId: string;
  periodCode: string;
  periodStartDate?: string;
  periodEndDate?: string;
  targetValue?: number;
  actualValue?: number;
  achievementRate?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create KPI Fact Amount DTO
 * POST /api/bff/kpi-master/fact-amounts
 */
export interface CreateKpiFactAmountDto {
  kpiMasterItemId: string;
  periodCode: string;
  periodStartDate?: string;
  periodEndDate?: string;
  targetValue?: number;
  actualValue?: number;
}

/**
 * Update KPI Fact Amount DTO
 * PUT /api/bff/kpi-master/fact-amounts/:id
 */
export interface UpdateKpiFactAmountDto {
  targetValue?: number;
  actualValue?: number;
}

// =============================================================================
// Target Value DTOs (Requirement 7: 指標目標値)
// =============================================================================

/**
 * KPI Target Value DTO
 */
export interface KpiTargetValueDto {
  id: string;
  kpiMasterItemId: string;
  periodCode: string;
  periodStartDate?: string;
  periodEndDate?: string;
  targetValue: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create KPI Target Value DTO
 * POST /api/bff/kpi-master/target-values
 */
export interface CreateKpiTargetValueDto {
  kpiMasterItemId: string;
  periodCode: string;
  periodStartDate?: string;
  periodEndDate?: string;
  targetValue: number;
}

/**
 * Update KPI Target Value DTO
 * PUT /api/bff/kpi-master/target-values/:id
 */
export interface UpdateKpiTargetValueDto {
  targetValue: number;
}
