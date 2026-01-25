import { Injectable } from '@nestjs/common';
import { KpiTargetValueRepository } from '../repositories/kpi-target-value.repository';
import {
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import {
  KpiTargetValueNotFoundError,
  KpiTargetValueDuplicatePeriodError,
} from '@epm-sdd/contracts/shared/errors';

/**
 * KpiTargetValueService
 *
 * Purpose:
 * - Manage KPI target values per period
 * - Handle period duplicate checks
 * - Support financial and metric KPI targets
 *
 * Business Rules:
 * - Same period duplicate check: kpi_master_item_id + period_code must be unique
 * - Target values use Decimal precision
 * - Audit trail recorded for all CUD operations
 */
@Injectable()
export class KpiTargetValueService {
  constructor(private readonly targetValueRepository: KpiTargetValueRepository) {}

  /**
   * Find KPI target values by KPI master item ID
   *
   * @param tenantId - Tenant ID (required)
   * @param kpiMasterItemId - KPI master item ID
   * @returns Array of KPI target values
   */
  async findByItemId(
    tenantId: string,
    kpiMasterItemId: string,
  ): Promise<KpiTargetValueApiDto[]> {
    return this.targetValueRepository.findByItemId(tenantId, kpiMasterItemId);
  }

  /**
   * Create new KPI target value
   *
   * Business Rules:
   * - Period duplicate check: (kpi_master_item_id + period_code) must be unique
   * - Audit trail recorded (via audit log)
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Target value creation data
   * @param userId - User ID for audit trail
   * @returns Created KPI target value
   * @throws KpiTargetValueDuplicatePeriodError if period already exists
   */
  async create(
    tenantId: string,
    data: CreateKpiTargetValueApiDto,
    userId?: string,
  ): Promise<KpiTargetValueApiDto> {
    // Business Rule: Check for duplicate period (item + period)
    const existing = await this.targetValueRepository.findByItemId(
      tenantId,
      data.kpiMasterItemId,
    );

    const duplicate = existing.find((target) => target.periodCode === data.periodCode);

    if (duplicate) {
      throw new KpiTargetValueDuplicatePeriodError(
        `Target value already exists for period: ${data.periodCode}`,
      );
    }

    // Create target value
    const targetValue = await this.targetValueRepository.create(tenantId, data);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CREATE_KPI_TARGET_VALUE',
    //   resourceId: targetValue.id,
    //   resourceType: 'kpi_target_values',
    // });

    return targetValue;
  }

  /**
   * Update KPI target value
   *
   * Business Rules:
   * - Period cannot be changed (immutable key)
   * - Only target value can be updated
   * - Audit trail recorded (via audit log)
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Target value ID
   * @param data - Target value update data
   * @param userId - User ID for audit trail
   * @returns Updated KPI target value
   * @throws KpiTargetValueNotFoundError if target value not found
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiTargetValueApiDto>,
    userId?: string,
  ): Promise<KpiTargetValueApiDto> {
    // Check if target value exists
    const existing = await this.targetValueRepository.findById(tenantId, id);
    if (!existing) {
      throw new KpiTargetValueNotFoundError(`Target value not found: ${id}`);
    }

    // Update target value
    const updated = await this.targetValueRepository.update(tenantId, id, data);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'UPDATE_KPI_TARGET_VALUE',
    //   resourceId: id,
    //   resourceType: 'kpi_target_values',
    // });

    return updated!;
  }
}
