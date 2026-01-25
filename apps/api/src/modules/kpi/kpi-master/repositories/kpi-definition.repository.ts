import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { AggregationMethod, Direction } from '@epm-sdd/contracts/shared/enums/kpi';

/**
 * KpiDefinitionRepository
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
export class KpiDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all KPI definitions with filters and pagination
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters (companyId, keyword, offset, limit)
   * @returns Array of KPI definitions matching filters
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
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Build WHERE clause (double-guard: RLS + application level)
    const where: any = {
      tenant_id: tenantId, // Required: tenant_id in WHERE clause
      is_active: true,
    };

    // Apply filters
    if (filters.companyId) {
      where.company_id = filters.companyId;
    }

    if (filters.keyword) {
      where.OR = [
        { kpi_code: { contains: filters.keyword, mode: 'insensitive' } },
        { kpi_name: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    // Build ORDER BY clause
    const orderBy: any = {};
    const sortBy = filters.sortBy || 'kpi_code';
    const sortOrder = filters.sortOrder || 'asc';

    // Map sortBy to database column names
    const sortByMap: Record<string, string> = {
      kpi_code: 'kpi_code',
      kpi_name: 'kpi_name',
      created_at: 'created_at',
    };

    orderBy[sortByMap[sortBy] || 'kpi_code'] = sortOrder;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.prisma.kpi_definitions.findMany({
        where,
        orderBy,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.kpi_definitions.count({ where }),
    ]);

    // Map to API DTO
    return {
      data: data.map((definition) => this.mapToApiDto(definition)),
      total,
    };
  }

  /**
   * Find KPI definition by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI definition ID
   * @returns KPI definition or null if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiDefinitionApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const definition = await this.prisma.kpi_definitions.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    return definition ? this.mapToApiDto(definition) : null;
  }

  /**
   * Find KPI definition by code (for duplicate check)
   *
   * @param tenantId - Tenant ID (required)
   * @param companyId - Company ID
   * @param kpiCode - KPI code
   * @returns KPI definition or null if not found
   */
  async findByCode(
    tenantId: string,
    companyId: string,
    kpiCode: string,
  ): Promise<KpiDefinitionApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const definition = await this.prisma.kpi_definitions.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        company_id: companyId,
        kpi_code: kpiCode,
        is_active: true,
      },
    });

    return definition ? this.mapToApiDto(definition) : null;
  }

  /**
   * Create new KPI definition
   *
   * @param tenantId - Tenant ID (required)
   * @param data - KPI definition creation data
   * @param userId - User ID for audit trail (optional)
   * @returns Created KPI definition
   */
  async create(
    tenantId: string,
    data: CreateKpiDefinitionApiDto,
    userId?: string,
  ): Promise<KpiDefinitionApiDto> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Create KPI definition with tenant_id
    const definition = await this.prisma.kpi_definitions.create({
      data: {
        tenant_id: tenantId, // Required: tenant_id for multi-tenant isolation
        company_id: data.companyId,
        kpi_code: data.kpiCode,
        kpi_name: data.kpiName,
        description: data.description,
        unit: data.unit,
        aggregation_method: data.aggregationMethod,
        direction: data.direction,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      },
    });

    return this.mapToApiDto(definition);
  }

  /**
   * Map Prisma model to API DTO
   *
   * @param definition - Prisma kpi_definitions model
   * @returns KpiDefinitionApiDto
   */
  private mapToApiDto(definition: any): KpiDefinitionApiDto {
    return {
      id: definition.id,
      companyId: definition.company_id,
      kpiCode: definition.kpi_code,
      kpiName: definition.kpi_name,
      description: definition.description || undefined,
      unit: definition.unit || undefined,
      aggregationMethod: definition.aggregation_method as AggregationMethod,
      direction: (definition.direction as Direction) || undefined,
      isActive: definition.is_active,
      createdAt: definition.created_at.toISOString(),
      updatedAt: definition.updated_at.toISOString(),
      createdBy: definition.created_by || undefined,
      updatedBy: definition.updated_by || undefined,
    };
  }
}
