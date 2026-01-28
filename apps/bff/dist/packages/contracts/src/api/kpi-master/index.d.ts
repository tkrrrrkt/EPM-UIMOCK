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
export interface GetKpiMasterEventsApiQueryDto {
    tenant_id: string;
    company_id: string;
    offset?: number;
    limit?: number;
    sort_by?: 'event_code' | 'event_name' | 'fiscal_year' | 'created_at';
    sort_order?: 'asc' | 'desc';
    keyword?: string;
    fiscal_year?: number;
    status?: 'DRAFT' | 'CONFIRMED';
}
export interface CreateKpiMasterEventApiDto {
    tenant_id: string;
    company_id: string;
    event_code: string;
    event_name: string;
    fiscal_year: number;
    created_by: string;
}
export interface UpdateKpiMasterEventApiDto {
    event_name?: string;
    status?: 'DRAFT' | 'CONFIRMED';
    updated_by: string;
}
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
export interface GetKpiMasterItemsApiQueryDto {
    tenant_id: string;
    company_id: string;
    event_id: string;
    department_stable_ids?: string[];
    kpi_type?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    hierarchy_level?: 1 | 2;
    include_inactive?: boolean;
}
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
export interface UpdateKpiMasterItemApiDto {
    kpi_name?: string;
    department_stable_id?: string;
    owner_employee_id?: string;
    unit?: string;
    sort_order?: number;
    updated_by: string;
}
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
export interface GetKpiDefinitionsApiQueryDto {
    tenant_id: string;
    company_id: string;
    offset?: number;
    limit?: number;
    sort_by?: 'kpi_code' | 'kpi_name' | 'created_at';
    sort_order?: 'asc' | 'desc';
    keyword?: string;
}
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
export interface GetKpiFactAmountsApiQueryDto {
    tenant_id: string;
    event_id: string;
    kpi_definition_id: string;
    department_stable_ids?: string[];
}
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
export interface UpdateKpiFactAmountApiDto {
    target_value?: number;
    actual_value?: number;
    notes?: string;
    updated_by: string;
}
export interface KpiTargetValueApiDto {
    id: string;
    tenant_id: string;
    kpi_master_item_id: string;
    period_code: string;
    target_value: number;
    created_at: string;
    updated_at: string;
}
export interface GetKpiTargetValuesApiQueryDto {
    tenant_id: string;
    kpi_master_item_id: string;
}
export interface CreateKpiTargetValueApiDto {
    tenant_id: string;
    kpi_master_item_id: string;
    period_code: string;
    target_value: number;
}
export interface UpdateKpiTargetValueApiDto {
    target_value: number;
}
export interface GetKpiMasterSummaryApiQueryDto {
    tenant_id: string;
    company_id: string;
    event_id: string;
    department_stable_ids?: string[];
}
export interface KpiMasterSummaryApiDto {
    total_kpi_count: number;
    avg_achievement_rate: number;
    delayed_action_plan_count: number;
    attention_required_count: number;
}
export interface SelectableSubjectApiDto {
    id: string;
    subject_code: string;
    subject_name: string;
    subject_type: string;
}
export interface SelectableMetricApiDto {
    id: string;
    metric_code: string;
    metric_name: string;
    formula?: string;
}
export interface GetSelectableSubjectsApiQueryDto {
    tenant_id: string;
    company_id: string;
}
export interface GetSelectableMetricsApiQueryDto {
    tenant_id: string;
    company_id: string;
}
