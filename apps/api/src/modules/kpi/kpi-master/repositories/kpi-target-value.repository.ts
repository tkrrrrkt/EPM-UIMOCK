import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * KpiTargetValueRepository
 *
 * Purpose:
 * - tenant_id required for all methods
 * - WHERE clause double-guard required (RLS + application level)
 * - set_config prerequisite (RLS enabled, no bypass)
 *
 * Repository Principles:
 * - All methods require tenantId as mandatory parameter
 * - All WHERE clauses must include tenant_id (RLS double-guard)
 * - Execute set_config('app.tenant_id', :tenant_id) before queries
 */
@Injectable()
export class KpiTargetValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find KPI target values by KPI master item ID
   *
   * @param tenantId - Tenant ID (required)
   * @param kpiMasterItemId - KPI master item ID
   * @returns Array of KPI target values
   */
  async findByItemId(tenantId: string, kpiMasterItemId: string): Promise<KpiTargetValueApiDto[]> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const targetValues = await this.prisma.kpi_target_values.findMany({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        kpi_master_item_id: kpiMasterItemId,
      },
      orderBy: {
        period_code: 'asc',
      },
    });

    return targetValues.map((target) => this.mapToApiDto(target));
  }

  /**
   * Find KPI target value by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Target value ID
   * @returns KPI target value or null if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiTargetValueApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const targetValue = await this.prisma.kpi_target_values.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
      },
    });

    return targetValue ? this.mapToApiDto(targetValue) : null;
  }

  /**
   * Create new KPI target value
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Target value creation data
   * @returns Created KPI target value
   */
  async create(
    tenantId: string,
    data: CreateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Create target value with tenant_id
    const targetValue = await this.prisma.kpi_target_values.create({
      data: {
        tenant_id: tenantId, // Required: tenant_id for multi-tenant isolation
        kpi_master_item_id: data.kpiMasterItemId,
        period_code: data.periodCode,
        target_value: new Decimal(data.targetValue),
      },
    });

    return this.mapToApiDto(targetValue);
  }

  /**
   * Update KPI target value
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Target value ID
   * @param data - Target value update data
   * @returns Updated KPI target value or null if not found
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiTargetValueApiDto>,
  ): Promise<KpiTargetValueApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Check if target value exists with tenant_id double-guard
    const existing = await this.prisma.kpi_target_values.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
      },
    });

    if (!existing) {
      return null;
    }

    // Update target value
    const targetValue = await this.prisma.kpi_target_values.update({
      where: { id },
      data: {
        ...(data.periodCode && { period_code: data.periodCode }),
        ...(data.targetValue !== undefined && { target_value: new Decimal(data.targetValue) }),
      },
    });

    return this.mapToApiDto(targetValue);
  }

  /**
   * Map Prisma model to API DTO
   *
   * @param target - Prisma kpi_target_values model
   * @returns KpiTargetValueApiDto
   */
  private mapToApiDto(target: any): KpiTargetValueApiDto {
    return {
      id: target.id,
      kpiMasterItemId: target.kpi_master_item_id,
      periodCode: target.period_code,
      targetValue: parseFloat(target.target_value.toString()),
      createdAt: target.created_at.toISOString(),
      updatedAt: target.updated_at.toISOString(),
    };
  }
}
