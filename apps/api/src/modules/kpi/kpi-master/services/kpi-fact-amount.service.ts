import { Injectable } from '@nestjs/common';
import { KpiFactAmountRepository } from '../repositories/kpi-fact-amount.repository';
import {
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import {
  KpiFactAmountNotFoundError,
  KpiFactAmountDuplicateError,
} from '@epm-sdd/contracts/shared/errors';

/**
 * KpiFactAmountService
 *
 * Purpose:
 * - Manage non-financial KPI actual/target values (plan-vs-actual)
 * - Handle period duplicate checks
 * - Support department-level KPI values
 *
 * Business Rules:
 * - Same period duplicate check: event_id + kpi_definition_id + period_code + department_stable_id must be unique
 * - Target/actual values use Decimal precision
 * - Achievement rate calculated in BFF layer (not here)
 * - Audit trail recorded for all CUD operations
 */
@Injectable()
export class KpiFactAmountService {
  constructor(private readonly factAmountRepository: KpiFactAmountRepository) {}

  /**
   * Find KPI fact amounts by KPI definition ID and event ID
   *
   * @param tenantId - Tenant ID (required)
   * @param kpiDefinitionId - KPI definition ID
   * @param eventId - KPI event ID
   * @returns Array of KPI fact amounts
   */
  async findByItemId(
    tenantId: string,
    kpiDefinitionId: string,
    eventId: string,
  ): Promise<KpiFactAmountApiDto[]> {
    return this.factAmountRepository.findByItemId(tenantId, kpiDefinitionId, eventId);
  }

  /**
   * Create new KPI fact amount
   *
   * Business Rules:
   * - Period duplicate check: (event_id + kpi_definition_id + period_code + department_stable_id) must be unique
   * - Audit trail recorded (created_by)
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Fact amount creation data
   * @param userId - User ID for audit trail
   * @returns Created KPI fact amount
   * @throws KpiFactAmountDuplicateError if period already exists
   */
  async create(
    tenantId: string,
    data: CreateKpiFactAmountApiDto,
    userId?: string,
  ): Promise<KpiFactAmountApiDto> {
    // Business Rule: Check for duplicate period (event + definition + period + department)
    const existing = await this.factAmountRepository.findByItemId(
      tenantId,
      data.kpiDefinitionId,
      data.kpiEventId,
    );

    const duplicate = existing.find(
      (fact) =>
        fact.periodCode === data.periodCode &&
        (fact.departmentStableId || null) === (data.departmentStableId || null),
    );

    if (duplicate) {
      throw new KpiFactAmountDuplicateError(
        `Fact amount already exists for period: ${data.periodCode}, department: ${data.departmentStableId || 'company-wide'}`,
      );
    }

    // Create fact amount
    const factAmount = await this.factAmountRepository.create(tenantId, data, userId);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CREATE_KPI_FACT_AMOUNT',
    //   resourceId: factAmount.id,
    //   resourceType: 'kpi_fact_amounts',
    // });

    return factAmount;
  }

  /**
   * Update KPI fact amount
   *
   * Business Rules:
   * - Period cannot be changed (immutable key)
   * - Only target/actual values can be updated
   * - Audit trail recorded (updated_by)
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Fact amount ID
   * @param data - Fact amount update data
   * @param userId - User ID for audit trail
   * @returns Updated KPI fact amount
   * @throws KpiFactAmountNotFoundError if fact amount not found
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiFactAmountApiDto>,
    userId?: string,
  ): Promise<KpiFactAmountApiDto> {
    // Check if fact amount exists
    const existing = await this.factAmountRepository.findById(tenantId, id);
    if (!existing) {
      throw new KpiFactAmountNotFoundError(`Fact amount not found: ${id}`);
    }

    // Update fact amount
    const updated = await this.factAmountRepository.update(tenantId, id, data, userId);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'UPDATE_KPI_FACT_AMOUNT',
    //   resourceId: id,
    //   resourceType: 'kpi_fact_amounts',
    // });

    return updated!;
  }
}
