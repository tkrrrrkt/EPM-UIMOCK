import { Injectable } from '@nestjs/common';
import { KpiDefinitionRepository } from '../repositories/kpi-definition.repository';
import {
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiDefinitionAlreadyExistsError } from '@epm-sdd/contracts/shared/errors';

/**
 * KpiDefinitionService
 *
 * Purpose:
 * - Manage non-financial KPI definitions
 * - Handle duplicate code checks
 * - Support manual input KPIs (non-calculated)
 *
 * Business Rules:
 * - kpi_code must be unique within company scope
 * - Definitions are immutable once created (no update in Phase 1)
 * - Audit trail recorded for creation
 */
@Injectable()
export class KpiDefinitionService {
  constructor(private readonly definitionRepository: KpiDefinitionRepository) {}

  /**
   * Find all KPI definitions with filters and pagination
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters
   * @returns Paginated list of KPI definitions
   */
  async findAll(
    tenantId: string,
    filters: {
      companyId?: string;
      keyword?: string;
      offset: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ data: KpiDefinitionApiDto[]; total: number }> {
    return this.definitionRepository.findAll(tenantId, filters);
  }

  /**
   * Create new KPI definition
   *
   * Business Rules:
   * - kpi_code must be unique within company scope
   * - Audit trail recorded (created_by)
   *
   * @param tenantId - Tenant ID (required)
   * @param data - KPI definition creation data
   * @param userId - User ID for audit trail
   * @returns Created KPI definition
   * @throws KpiDefinitionAlreadyExistsError if kpi_code already exists
   */
  async create(
    tenantId: string,
    data: CreateKpiDefinitionApiDto,
    userId?: string,
  ): Promise<KpiDefinitionApiDto> {
    // Business Rule: Check for duplicate kpi_code within company scope
    const existing = await this.definitionRepository.findByCode(
      tenantId,
      data.companyId,
      data.kpiCode,
    );

    if (existing) {
      throw new KpiDefinitionAlreadyExistsError(
        `KPI definition code already exists: ${data.kpiCode} in company ${data.companyId}`,
      );
    }

    // Create KPI definition
    const definition = await this.definitionRepository.create(tenantId, data, userId);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CREATE_KPI_DEFINITION',
    //   resourceId: definition.id,
    //   resourceType: 'kpi_definitions',
    // });

    return definition;
  }
}
