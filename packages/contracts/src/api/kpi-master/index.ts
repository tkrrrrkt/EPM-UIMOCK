/**
 * KPI Master API Contracts
 *
 * Purpose: Domain API DTOs (DB-friendly format)
 * Naming: snake_case for consistency with DB columns
 * Source: .kiro/specs/kpi/kpi-master/design.md
 */

// =============================================================================
// Event DTOs
// =============================================================================

/**
 * KPI Master Event API DTO
 */
export interface KpiMasterEventApiDto {
  id: string;
  tenant_id: string;
  company_id: string;
  event_code: string;
  event_name: string;
  fiscal_year: number;
  status: 'DRAFT' | 'CONFIRMED';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Get KPI Master Events Query API DTO
 */
export interface GetKpiMasterEventsApiQueryDto {
  tenant_id: string;
  company_id: string;
  /** offset-based pagination */
  offset?: number;
  limit?: number;
  sort_by?: 'event_code' | 'event_name' | 'fiscal_year' | 'created_at';
  sort_order?: 'asc' | 'desc';
  keyword?: string;
  fiscal_year?: number;
  status?: 'DRAFT' | 'CONFIRMED';
}

/**
 * Create KPI Master Event API DTO
 */
export interface CreateKpiMasterEventApiDto {
  tenant_id: string;
  company_id: string;
  event_code: string;
  event_name: string;
  fiscal_year: number;
  created_by: string;
}

/**
 * Update KPI Master Event API DTO
 */
export interface UpdateKpiMasterEventApiDto {
  event_name?: string;
  status?: 'DRAFT' | 'CONFIRMED';
  updated_by: string;
}

// =============================================================================
// KPI Item DTOs
// =============================================================================

/**
 * KPI Master Item API DTO
 */
export interface KpiMasterItemApiDto {
  id: string;
  tenant_id: string;
  company_id: string;
  event_id: string;
  kpi_code: string;
  kpi_name: string;
  kpi_type: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  hierarchy_level: 1 | 2;
  parent_kpi_item_id?: string;
  ref_subject_id?: string;
  ref_kpi_definition_id?: string;
  ref_metric_id?: string;
  department_stable_id?: string;
  owner_employee_id?: string;
  unit?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Get KPI Master Items Query API DTO
 */
export interface GetKpiMasterItemsApiQueryDto {
  tenant_id: string;
  company_id: string;
  event_id: string;
  department_stable_ids?: string[];
  kpi_type?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  hierarchy_level?: 1 | 2;
  include_inactive?: boolean;
}

/**
 * Create KPI Master Item API DTO
 */
export interface CreateKpiMasterItemApiDto {
  tenant_id: string;
  company_id: string;
  event_id: string;
  kpi_code: string;
  kpi_name: string;
  kpi_type: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  hierarchy_level: 1 | 2;
  parent_kpi_item_id?: string;
  ref_subject_id?: string;
  ref_kpi_definition_id?: string;
  ref_metric_id?: string;
  department_stable_id?: string;
  owner_employee_id?: string;
  unit?: string;
  sort_order?: number;
  created_by: string;
}

/**
 * Update KPI Master Item API DTO
 */
export interface UpdateKpiMasterItemApiDto {
  kpi_name?: string;
  department_stable_id?: string;
  owner_employee_id?: string;
  unit?: string;
  sort_order?: number;
  updated_by: string;
}

// =============================================================================
// KPI Definition DTOs
// =============================================================================

/**
 * KPI Definition API DTO
 */
export interface KpiDefinitionApiDto {
  id: string;
  tenant_id: string;
  company_id: string;
  kpi_code: string;
  kpi_name: string;
  description?: string;
  unit?: string;
  aggregation_method: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: 'higher_is_better' | 'lower_is_better';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Get KPI Definitions Query API DTO
 */
export interface GetKpiDefinitionsApiQueryDto {
  tenant_id: string;
  company_id: string;
  offset?: number;
  limit?: number;
  sort_by?: 'kpi_code' | 'kpi_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
  keyword?: string;
}

/**
 * Create KPI Definition API DTO
 */
export interface CreateKpiDefinitionApiDto {
  tenant_id: string;
  company_id: string;
  kpi_code: string;
  kpi_name: string;
  description?: string;
  unit?: string;
  aggregation_method: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: 'higher_is_better' | 'lower_is_better';
  created_by: string;
}

// =============================================================================
// Fact Amount DTOs
// =============================================================================

/**
 * KPI Fact Amount API DTO
 */
export interface KpiFactAmountApiDto {
  id: string;
  tenant_id: string;
  company_id: string;
  event_id: string;
  kpi_definition_id: string;
  department_stable_id?: string;
  period_code: string;
  period_start_date?: string;
  period_end_date?: string;
  target_value?: number;
  actual_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Get KPI Fact Amounts Query API DTO
 */
export interface GetKpiFactAmountsApiQueryDto {
  tenant_id: string;
  event_id: string;
  kpi_definition_id: string;
  department_stable_ids?: string[];
}

/**
 * Create KPI Fact Amount API DTO
 */
export interface CreateKpiFactAmountApiDto {
  tenant_id: string;
  event_id: string;
  kpi_definition_id: string;
  department_stable_id?: string;
  period_code: string;
  period_start_date?: string;
  period_end_date?: string;
  target_value?: number;
  actual_value?: number;
  notes?: string;
  created_by: string;
}

/**
 * Update KPI Fact Amount API DTO
 */
export interface UpdateKpiFactAmountApiDto {
  target_value?: number;
  actual_value?: number;
  notes?: string;
  updated_by: string;
}

// =============================================================================
// Target Value DTOs
// =============================================================================

/**
 * KPI Target Value API DTO
 */
export interface KpiTargetValueApiDto {
  id: string;
  tenant_id: string;
  kpi_master_item_id: string;
  period_code: string;
  target_value: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get KPI Target Values Query API DTO
 */
export interface GetKpiTargetValuesApiQueryDto {
  tenant_id: string;
  kpi_master_item_id: string;
}

/**
 * Create KPI Target Value API DTO
 */
export interface CreateKpiTargetValueApiDto {
  tenant_id: string;
  kpi_master_item_id: string;
  period_code: string;
  target_value: number;
}

/**
 * Update KPI Target Value API DTO
 */
export interface UpdateKpiTargetValueApiDto {
  target_value: number;
}

// =============================================================================
// Summary DTOs
// =============================================================================

/**
 * KPI Master Summary Query API DTO
 */
export interface GetKpiMasterSummaryApiQueryDto {
  tenant_id: string;
  company_id: string;
  event_id: string;
  department_stable_ids?: string[];
}

/**
 * KPI Master Summary Response API DTO
 */
export interface KpiMasterSummaryApiDto {
  total_kpi_count: number;
  avg_achievement_rate: number;
  delayed_action_plan_count: number;
  attention_required_count: number;
}

// =============================================================================
// Selectable Options DTOs
// =============================================================================

/**
 * Selectable Subject API DTO
 */
export interface SelectableSubjectApiDto {
  id: string;
  subject_code: string;
  subject_name: string;
  subject_type: string;
}

/**
 * Selectable Metric API DTO
 */
export interface SelectableMetricApiDto {
  id: string;
  metric_code: string;
  metric_name: string;
  formula?: string;
}

/**
 * Get Selectable Subjects Query API DTO
 */
export interface GetSelectableSubjectsApiQueryDto {
  tenant_id: string;
  company_id: string;
}

/**
 * Get Selectable Metrics Query API DTO
 */
export interface GetSelectableMetricsApiQueryDto {
  tenant_id: string;
  company_id: string;
}
