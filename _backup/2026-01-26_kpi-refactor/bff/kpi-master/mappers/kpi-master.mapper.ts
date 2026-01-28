import {
  KpiMasterEventDto,
  KpiMasterItemDto,
  KpiMasterItemDetailDto,
  PeriodFactDto,
  ActionPlanSummaryDto,
} from '@epm-sdd/contracts/bff/kpi-master';
import {
  KpiMasterEventApiDto,
  KpiMasterItemApiDto,
  KpiFactAmountApiDto,
  KpiTargetValueApiDto,
} from '@epm-sdd/contracts/api/kpi-master';

/**
 * KpiMasterMapper
 *
 * Purpose:
 * - Transform API DTOs to BFF DTOs
 * - Calculate achievement rates (actual/target × 100)
 * - Assemble hierarchy (periodFacts object from arrays)
 * - Master data join (departmentName, ownerName)
 *
 * BFF Transformation Rules:
 * - Hierarchy assembly: parent_kpi_item_id → children array
 * - Period data structuring: fact_amounts array → periodMap object
 * - Achievement rate calculation: actual/target × 100
 * - Master data join: department_stable_id → departmentName, owner_employee_id → ownerName
 */
export const KpiMasterMapper = {
  /**
   * Map KpiMasterEventApiDto to KpiMasterEventDto
   */
  toKpiMasterEventDto(apiDto: KpiMasterEventApiDto): KpiMasterEventDto {
    return {
      id: apiDto.id,
      companyId: apiDto.companyId,
      eventCode: apiDto.eventCode,
      eventName: apiDto.eventName,
      fiscalYear: apiDto.fiscalYear,
      status: apiDto.status,
      isActive: apiDto.isActive,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
      createdBy: apiDto.createdBy,
      updatedBy: apiDto.updatedBy,
    };
  },

  /**
   * Map KpiMasterItemApiDto to KpiMasterItemDto (basic list item)
   */
  toKpiMasterItemDto(apiDto: KpiMasterItemApiDto): KpiMasterItemDto {
    return {
      id: apiDto.id,
      kpiEventId: apiDto.kpiEventId,
      parentKpiItemId: apiDto.parentKpiItemId,
      kpiCode: apiDto.kpiCode,
      kpiName: apiDto.kpiName,
      kpiType: apiDto.kpiType,
      hierarchyLevel: apiDto.hierarchyLevel,
      refSubjectId: apiDto.refSubjectId,
      refKpiDefinitionId: apiDto.refKpiDefinitionId,
      refMetricId: apiDto.refMetricId,
      departmentStableId: apiDto.departmentStableId,
      // TODO: Join master data for departmentName
      departmentName: undefined,
      ownerEmployeeId: apiDto.ownerEmployeeId,
      // TODO: Join master data for ownerName
      ownerName: undefined,
      sortOrder: apiDto.sortOrder,
      isActive: apiDto.isActive,
      createdAt: apiDto.createdAt,
      updatedAt: apiDto.updatedAt,
    };
  },

  /**
   * Map KpiMasterItemApiDto to KpiMasterItemDetailDto (with period facts and action plans)
   *
   * This is the main transformation for detail view:
   * - Assembles periodFacts from fact amounts and target values
   * - Calculates achievement rates (actual/target × 100)
   * - Maps action plans summary
   *
   * @param apiDto - KPI item API DTO
   * @param factAmounts - Fact amounts (non-financial KPI)
   * @param targetValues - Target values (financial/metric KPI)
   * @param actionPlans - Action plans linked to this KPI item
   */
  toKpiMasterItemDetailDto(
    apiDto: KpiMasterItemApiDto,
    factAmounts: KpiFactAmountApiDto[],
    targetValues: KpiTargetValueApiDto[],
    actionPlans: any[], // TODO: Type with ActionPlanApiDto when available
  ): KpiMasterItemDetailDto {
    // Base item mapping
    const baseItem = this.toKpiMasterItemDto(apiDto);

    // Assemble periodFacts from fact amounts and target values
    const periodFacts = this.assemblePeriodFacts(
      apiDto.kpiType,
      factAmounts,
      targetValues,
    );

    // Map action plans summary
    const actionPlansSummary: ActionPlanSummaryDto[] = actionPlans.map((plan) => ({
      id: plan.id,
      planCode: plan.planCode,
      planName: plan.planName,
      status: plan.status,
      progress: plan.progress,
    }));

    return {
      ...baseItem,
      periodFacts,
      actionPlans: actionPlansSummary,
    };
  },

  /**
   * Assemble period facts from fact amounts and target values
   *
   * BFF Transformation:
   * - Converts array of fact amounts/target values into period-keyed object
   * - Calculates achievement rate (actual/target × 100)
   * - Handles three KPI types: FINANCIAL, NON_FINANCIAL, METRIC
   *
   * @param kpiType - KPI type (FINANCIAL/NON_FINANCIAL/METRIC)
   * @param factAmounts - Fact amounts array (for NON_FINANCIAL)
   * @param targetValues - Target values array (for FINANCIAL/METRIC)
   * @returns Period-keyed object with facts and achievement rates
   */
  assemblePeriodFacts(
    kpiType: string,
    factAmounts: KpiFactAmountApiDto[],
    targetValues: KpiTargetValueApiDto[],
  ): Record<string, PeriodFactDto> {
    const periodFacts: Record<string, PeriodFactDto> = {};

    switch (kpiType) {
      case 'NON_FINANCIAL':
        // Non-financial KPI: Use fact amounts (manual input)
        for (const fact of factAmounts) {
          periodFacts[fact.periodCode] = {
            periodCode: fact.periodCode,
            targetValue: fact.targetValue,
            actualValue: fact.actualValue,
            achievementRate: this.calculateAchievementRate(
              fact.actualValue,
              fact.targetValue,
            ),
            notes: fact.notes,
          };
        }
        break;

      case 'FINANCIAL':
      case 'METRIC':
        // Financial/Metric KPI: Use target values + actual values from other sources
        // TODO: For FINANCIAL, fetch actual values from fact_amounts table (subject-based)
        // TODO: For METRIC, calculate actual values from metric formulas (Phase 2)
        for (const target of targetValues) {
          periodFacts[target.periodCode] = {
            periodCode: target.periodCode,
            targetValue: target.targetValue,
            actualValue: undefined, // TODO: Fetch/calculate actual values
            achievementRate: undefined, // Cannot calculate without actual
            notes: undefined,
          };
        }
        break;

      default:
        // Unknown KPI type, return empty
        break;
    }

    return periodFacts;
  },

  /**
   * Calculate achievement rate (actual/target × 100)
   *
   * BFF Responsibility:
   * - Achievement rate is NOT stored in database
   * - Calculated on-the-fly in BFF layer for UI display
   * - Returns undefined if either value is missing
   * - Rounds to 1 decimal place
   *
   * @param actualValue - Actual value
   * @param targetValue - Target value
   * @returns Achievement rate percentage (0-100+) or undefined
   */
  calculateAchievementRate(
    actualValue: number | undefined,
    targetValue: number | undefined,
  ): number | undefined {
    if (actualValue === undefined || targetValue === undefined || targetValue === 0) {
      return undefined;
    }

    // Calculate: (actual / target) × 100
    const rate = (actualValue / targetValue) * 100;

    // Round to 1 decimal place
    return Math.round(rate * 10) / 10;
  },
};
