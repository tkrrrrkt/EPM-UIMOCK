/**
 * KPI Master BFF Mapper
 *
 * Purpose:
 * - Transform Domain API DTOs (snake_case) to BFF DTOs (camelCase)
 * - Build hierarchical structures (parent_kpi_item_id → children array)
 * - Calculate achievement rates (actual/target × 100)
 * - Format period data (fact_amounts array → periodMap object)
 * - Join master data (department_stable_id → departmentName, owner_employee_id → ownerName)
 *
 * Reference: .kiro/specs/kpi/kpi-master/design.md (Task 5.3)
 */
import type {
  KpiMasterEventListDto,
  KpiMasterEventDto,
  KpiMasterEventDetailDto,
  CreateKpiMasterEventDto,
  KpiMasterItemDto,
  KpiMasterItemDetailDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  SelectableSubjectListDto,
  SelectableMetricListDto,
  KpiDefinitionListDto,
  KpiDefinitionDto,
  CreateKpiDefinitionDto,
  CreateKpiFactAmountDto,
  UpdateKpiFactAmountDto,
  KpiFactAmountDto,
  CreateKpiTargetValueDto,
  UpdateKpiTargetValueDto,
  KpiTargetValueDto,
} from '@epm/contracts/bff/kpi-master';
import type {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
  CreateKpiFactAmountApiDto,
  UpdateKpiFactAmountApiDto,
  KpiFactAmountApiDto,
  CreateKpiTargetValueApiDto,
  UpdateKpiTargetValueApiDto,
  KpiTargetValueApiDto,
  SelectableSubjectApiDto,
  SelectableMetricApiDto,
} from '@epm/contracts/api/kpi-master';

export class KpiMasterMapper {
  // =========================================================================
  // Event Mappers
  // =========================================================================

  /**
   * Transform event list with pagination
   */
  static toEventList(
    items: KpiMasterEventApiDto[],
    total: number,
    page: number,
    pageSize: number,
  ): KpiMasterEventListDto {
    return {
      items: items.map(this.toEventDto),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Transform single event to DTO
   */
  static toEventDto(event: KpiMasterEventApiDto): KpiMasterEventDto {
    return {
      id: event.id,
      eventCode: event.event_code,
      eventName: event.event_name,
      fiscalYear: event.fiscal_year,
      status: event.status,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  }

  /**
   * Transform event to detail DTO
   */
  static toEventDetail(event: KpiMasterEventApiDto): KpiMasterEventDetailDto {
    return {
      ...this.toEventDto(event),
      kpiItems: [],
    };
  }

  /**
   * Transform BFF create DTO to API DTO
   */
  static toCreateEventApiDto(
    data: CreateKpiMasterEventDto,
    companyId: string,
  ): Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'> {
    return {
      company_id: companyId,
      event_code: data.eventCode,
      event_name: data.eventName,
      fiscal_year: data.fiscalYear,
    };
  }

  // =========================================================================
  // Item Mappers
  // =========================================================================

  /**
   * Transform item list with pagination
   */
  static toItemList(
    items: KpiMasterItemApiDto[],
  ): KpiMasterItemDto[] {
    return items.map(this.toItemDto);
  }

  /**
   * Transform single item to DTO
   */
  static toItemDto(item: KpiMasterItemApiDto): KpiMasterItemDto {
    return {
      id: item.id,
      eventId: item.event_id,
      kpiCode: item.kpi_code,
      kpiName: item.kpi_name,
      kpiType: item.kpi_type,
      hierarchyLevel: item.hierarchy_level,
      parentKpiItemId: item.parent_kpi_item_id,
      departmentStableId: item.department_stable_id,
      departmentName: undefined,
      ownerEmployeeId: item.owner_employee_id,
      ownerEmployeeName: undefined,
      unit: item.unit,
      achievementRate: this.calculateAchievementRate(0, 0), // TODO: Phase 2 - 実績値取得
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  /**
   * Transform item to detail DTO
   */
  static toItemDetail(item: KpiMasterItemApiDto): KpiMasterItemDetailDto {
    return {
      ...this.toItemDto(item),
      // TODO: Phase 2 - 予実データ、目標値データ、階層構造、AP一覧
      factAmounts: [],
      actionPlans: [],
    };
  }

  /**
   * Transform BFF create DTO to API DTO
   */
  static toCreateItemApiDto(
    data: CreateKpiMasterItemDto,
    companyId: string,
  ): Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'> {
    return {
      company_id: companyId,
      event_id: data.eventId,
      kpi_code: data.kpiCode,
      kpi_name: data.kpiName,
      kpi_type: data.kpiType,
      hierarchy_level: data.hierarchyLevel,
      parent_kpi_item_id: data.parentKpiItemId,
      ref_subject_id: data.refSubjectId,
      ref_kpi_definition_id: data.refKpiDefinitionId,
      ref_metric_id: data.refMetricId,
      department_stable_id: data.departmentStableId,
      owner_employee_id: data.ownerEmployeeId,
      unit: data.unit,
    };
  }

  /**
   * Transform BFF update DTO to API DTO
   */
  static toUpdateItemApiDto(data: UpdateKpiMasterItemDto): Omit<UpdateKpiMasterItemApiDto, 'updated_by'> {
    return {
      kpi_name: data.kpiName,
      department_stable_id: data.departmentStableId,
      owner_employee_id: data.ownerEmployeeId,
      unit: data.unit,
    };
  }

  /**
   * Transform selectable subjects to list DTO
   */
  static toSelectableSubjectList(subjects: SelectableSubjectApiDto[]): SelectableSubjectListDto {
    return {
      subjects: subjects.map((s) => ({
        id: s.id,
        subjectCode: s.subject_code,
        subjectName: s.subject_name,
        subjectType: s.subject_type,
      })),
    };
  }

  /**
   * Transform selectable metrics to list DTO
   */
  static toSelectableMetricList(metrics: SelectableMetricApiDto[]): SelectableMetricListDto {
    return {
      metrics: metrics.map((m) => ({
        id: m.id,
        metricCode: m.metric_code,
        metricName: m.metric_name,
        formula: m.formula,
      })),
    };
  }

  // =========================================================================
  // KPI Definition Mappers
  // =========================================================================

  /**
   * Transform KPI definition list with pagination
   */
  static toDefinitionList(
    items: KpiDefinitionApiDto[],
    total: number,
    page: number,
    pageSize: number,
  ): KpiDefinitionListDto {
    return {
      items: items.map(this.toDefinitionDto),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Transform single KPI definition to DTO
   */
  static toDefinitionDto(definition: KpiDefinitionApiDto): KpiDefinitionDto {
    return {
      id: definition.id,
      kpiCode: definition.kpi_code,
      kpiName: definition.kpi_name,
      description: definition.description,
      unit: definition.unit,
      aggregationMethod: definition.aggregation_method,
      direction: definition.direction,
      createdAt: definition.created_at,
      updatedAt: definition.updated_at,
    };
  }

  /**
   * Transform BFF create DTO to API DTO
   */
  static toCreateDefinitionApiDto(
    data: CreateKpiDefinitionDto,
    companyId: string,
  ): Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'> {
    return {
      company_id: companyId,
      kpi_code: data.kpiCode,
      kpi_name: data.kpiName,
      description: data.description,
      unit: data.unit,
      aggregation_method: data.aggregationMethod,
      direction: data.direction,
    };
  }

  // =========================================================================
  // Fact Amount Mappers
  // =========================================================================

  /**
   * Transform fact amount to DTO
   */
  static toFactAmountDto(
    factAmount: KpiFactAmountApiDto,
    kpiMasterItemIdOverride?: string,
  ): KpiFactAmountDto {
    return {
      id: factAmount.id,
      kpiMasterItemId: kpiMasterItemIdOverride || factAmount.kpi_definition_id,
      periodCode: factAmount.period_code,
      periodStartDate: factAmount.period_start_date,
      periodEndDate: factAmount.period_end_date,
      targetValue: factAmount.target_value,
      actualValue: factAmount.actual_value,
      achievementRate: this.calculateAchievementRate(
        factAmount.actual_value,
        factAmount.target_value,
      ),
      createdAt: factAmount.created_at,
      updatedAt: factAmount.updated_at,
    };
  }

  /**
   * Transform BFF create DTO to API DTO
   */
  static toCreateFactAmountApiDto(
    data: CreateKpiFactAmountDto,
    context: { eventId: string; kpiDefinitionId: string },
  ): Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'> {
    return {
      event_id: context.eventId,
      kpi_definition_id: context.kpiDefinitionId,
      period_code: data.periodCode,
      period_start_date: data.periodStartDate,
      period_end_date: data.periodEndDate,
      target_value: data.targetValue,
      actual_value: data.actualValue,
    };
  }

  /**
   * Transform BFF update DTO to API DTO
   */
  static toUpdateFactAmountApiDto(data: UpdateKpiFactAmountDto): Omit<UpdateKpiFactAmountApiDto, 'updated_by'> {
    return {
      target_value: data.targetValue,
      actual_value: data.actualValue,
    };
  }

  // =========================================================================
  // Target Value Mappers
  // =========================================================================

  /**
   * Transform target value to DTO
   */
  static toTargetValueDto(targetValue: KpiTargetValueApiDto): KpiTargetValueDto {
    return {
      id: targetValue.id,
      kpiMasterItemId: targetValue.kpi_master_item_id,
      periodCode: targetValue.period_code,
      targetValue: targetValue.target_value,
      createdAt: targetValue.created_at,
      updatedAt: targetValue.updated_at,
    };
  }

  /**
   * Transform BFF create DTO to API DTO
   */
  static toCreateTargetValueApiDto(data: CreateKpiTargetValueDto): Omit<CreateKpiTargetValueApiDto, 'tenant_id'> {
    return {
      kpi_master_item_id: data.kpiMasterItemId,
      period_code: data.periodCode,
      target_value: data.targetValue,
    };
  }

  /**
   * Transform BFF update DTO to API DTO
   */
  static toUpdateTargetValueApiDto(data: UpdateKpiTargetValueDto): UpdateKpiTargetValueApiDto {
    return {
      target_value: data.targetValue,
    };
  }

  // =========================================================================
  // Helper Functions
  // =========================================================================

  /**
   * Calculate achievement rate
   * @param actual 実績値
   * @param target 目標値
   * @returns Achievement rate (0-100, 1 decimal place)
   */
  private static calculateAchievementRate(
    actual: number | null | undefined,
    target: number | null | undefined,
  ): number | undefined {
    if (actual == null || target == null || target === 0) {
      return undefined;
    }
    return Math.round((actual / target) * 1000) / 10; // 小数第1位まで
  }
}
