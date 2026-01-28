import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * KpiFactAmountRepository
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
export class KpiFactAmountRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const factAmounts = await this.prisma.kpi_fact_amounts.findMany({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        kpi_definition_id: kpiDefinitionId,
        kpi_event_id: eventId,
      },
      orderBy: {
        period_code: 'asc',
      },
    });

    return factAmounts.map((fact) => this.mapToApiDto(fact));
  }

  /**
   * Find KPI fact amount by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Fact amount ID
   * @returns KPI fact amount or null if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiFactAmountApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const factAmount = await this.prisma.kpi_fact_amounts.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
      },
    });

    return factAmount ? this.mapToApiDto(factAmount) : null;
  }

  /**
   * Create new KPI fact amount
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Fact amount creation data
   * @param userId - User ID for audit trail (optional)
   * @returns Created KPI fact amount
   */
  async create(
    tenantId: string,
    data: CreateKpiFactAmountApiDto,
    userId?: string,
  ): Promise<KpiFactAmountApiDto> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Create fact amount with tenant_id
    const factAmount = await this.prisma.kpi_fact_amounts.create({
      data: {
        tenant_id: tenantId, // Required: tenant_id for multi-tenant isolation
        company_id: data.companyId,
        kpi_event_id: data.kpiEventId,
        kpi_definition_id: data.kpiDefinitionId,
        period_code: data.periodCode,
        period_start_date: data.periodStartDate ? new Date(data.periodStartDate) : undefined,
        period_end_date: data.periodEndDate ? new Date(data.periodEndDate) : undefined,
        target_value: data.targetValue !== undefined ? new Decimal(data.targetValue) : undefined,
        actual_value: data.actualValue !== undefined ? new Decimal(data.actualValue) : undefined,
        department_stable_id: data.departmentStableId,
        notes: data.notes,
        created_by: userId,
        updated_by: userId,
      },
    });

    return this.mapToApiDto(factAmount);
  }

  /**
   * Update KPI fact amount
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Fact amount ID
   * @param data - Fact amount update data
   * @param userId - User ID for audit trail (optional)
   * @returns Updated KPI fact amount or null if not found
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiFactAmountApiDto>,
    userId?: string,
  ): Promise<KpiFactAmountApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Check if fact amount exists with tenant_id double-guard
    const existing = await this.prisma.kpi_fact_amounts.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
      },
    });

    if (!existing) {
      return null;
    }

    // Update fact amount
    const factAmount = await this.prisma.kpi_fact_amounts.update({
      where: { id },
      data: {
        ...(data.periodStartDate !== undefined && {
          period_start_date: data.periodStartDate ? new Date(data.periodStartDate) : null,
        }),
        ...(data.periodEndDate !== undefined && {
          period_end_date: data.periodEndDate ? new Date(data.periodEndDate) : null,
        }),
        ...(data.targetValue !== undefined && {
          target_value: data.targetValue !== null ? new Decimal(data.targetValue) : null,
        }),
        ...(data.actualValue !== undefined && {
          actual_value: data.actualValue !== null ? new Decimal(data.actualValue) : null,
        }),
        ...(data.departmentStableId !== undefined && {
          department_stable_id: data.departmentStableId,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by: userId,
      },
    });

    return this.mapToApiDto(factAmount);
  }

  /**
   * Map Prisma model to API DTO
   *
   * @param fact - Prisma kpi_fact_amounts model
   * @returns KpiFactAmountApiDto
   */
  private mapToApiDto(fact: any): KpiFactAmountApiDto {
    return {
      id: fact.id,
      companyId: fact.company_id,
      kpiEventId: fact.kpi_event_id,
      kpiDefinitionId: fact.kpi_definition_id,
      periodCode: fact.period_code,
      periodStartDate: fact.period_start_date?.toISOString(),
      periodEndDate: fact.period_end_date?.toISOString(),
      targetValue: fact.target_value ? parseFloat(fact.target_value.toString()) : undefined,
      actualValue: fact.actual_value ? parseFloat(fact.actual_value.toString()) : undefined,
      departmentStableId: fact.department_stable_id || undefined,
      notes: fact.notes || undefined,
      createdAt: fact.created_at.toISOString(),
      updatedAt: fact.updated_at.toISOString(),
      createdBy: fact.created_by || undefined,
      updatedBy: fact.updated_by || undefined,
    };
  }
}
