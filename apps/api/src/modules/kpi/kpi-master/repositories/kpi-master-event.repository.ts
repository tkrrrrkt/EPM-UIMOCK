import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiMasterEventStatus } from '@epm-sdd/contracts/shared/enums/kpi';

/**
 * KpiMasterEventRepository
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
export class KpiMasterEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all KPI master events with filters and pagination
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters (keyword, fiscalYear, status)
   * @param pagination - Pagination parameters (offset, limit, sortBy, sortOrder)
   * @returns Array of KPI master events matching filters
   */
  async findAll(
    tenantId: string,
    filters: GetKpiMasterEventsApiQueryDto,
  ): Promise<{ data: KpiMasterEventApiDto[]; total: number }> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Build WHERE clause (double-guard: RLS + application level)
    const where: any = {
      tenant_id: tenantId, // Required: tenant_id in WHERE clause
      is_active: true,
    };

    // Apply filters
    if (filters.keyword) {
      where.OR = [
        { event_code: { contains: filters.keyword, mode: 'insensitive' } },
        { event_name: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    if (filters.fiscalYear !== undefined) {
      where.fiscal_year = filters.fiscalYear;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Build ORDER BY clause
    const orderBy: any = {};
    const sortBy = filters.sortBy || 'event_code';
    const sortOrder = filters.sortOrder || 'asc';

    // Map sortBy to database column names
    const sortByMap: Record<string, string> = {
      event_code: 'event_code',
      event_name: 'event_name',
      fiscal_year: 'fiscal_year',
      created_at: 'created_at',
    };

    orderBy[sortByMap[sortBy] || 'event_code'] = sortOrder;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.prisma.kpi_master_events.findMany({
        where,
        orderBy,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.kpi_master_events.count({ where }),
    ]);

    // Map to API DTO
    return {
      data: data.map((event) => this.mapToApiDto(event)),
      total,
    };
  }

  /**
   * Find KPI master event by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Event ID
   * @returns KPI master event or null if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiMasterEventApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const event = await this.prisma.kpi_master_events.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    return event ? this.mapToApiDto(event) : null;
  }

  /**
   * Find KPI master event by event code (for duplicate check)
   *
   * @param tenantId - Tenant ID (required)
   * @param companyId - Company ID
   * @param eventCode - Event code
   * @returns KPI master event or null if not found
   */
  async findByEventCode(
    tenantId: string,
    companyId: string,
    eventCode: string,
  ): Promise<KpiMasterEventApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const event = await this.prisma.kpi_master_events.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        company_id: companyId,
        event_code: eventCode,
        is_active: true,
      },
    });

    return event ? this.mapToApiDto(event) : null;
  }

  /**
   * Create new KPI master event
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Event creation data
   * @param userId - User ID for audit trail (optional)
   * @returns Created KPI master event
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterEventApiDto,
    userId?: string,
  ): Promise<KpiMasterEventApiDto> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Create event with tenant_id
    const event = await this.prisma.kpi_master_events.create({
      data: {
        tenant_id: tenantId, // Required: tenant_id for multi-tenant isolation
        company_id: data.companyId,
        event_code: data.eventCode,
        event_name: data.eventName,
        fiscal_year: data.fiscalYear,
        status: KpiMasterEventStatus.DRAFT, // Default status
        is_active: true,
        created_by: userId,
        updated_by: userId,
      },
    });

    return this.mapToApiDto(event);
  }

  /**
   * Update KPI master event
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Event ID
   * @param data - Event update data
   * @param userId - User ID for audit trail (optional)
   * @returns Updated KPI master event or null if not found
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiMasterEventApiDto> & { status?: KpiMasterEventStatus },
    userId?: string,
  ): Promise<KpiMasterEventApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Check if event exists with tenant_id double-guard
    const existing = await this.prisma.kpi_master_events.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    if (!existing) {
      return null;
    }

    // Update event
    const event = await this.prisma.kpi_master_events.update({
      where: { id },
      data: {
        ...(data.companyId && { company_id: data.companyId }),
        ...(data.eventCode && { event_code: data.eventCode }),
        ...(data.eventName && { event_name: data.eventName }),
        ...(data.fiscalYear && { fiscal_year: data.fiscalYear }),
        ...(data.status && { status: data.status }),
        updated_by: userId,
      },
    });

    return this.mapToApiDto(event);
  }

  /**
   * Map Prisma model to API DTO
   *
   * @param event - Prisma kpi_master_events model
   * @returns KpiMasterEventApiDto
   */
  private mapToApiDto(event: any): KpiMasterEventApiDto {
    return {
      id: event.id,
      companyId: event.company_id,
      eventCode: event.event_code,
      eventName: event.event_name,
      fiscalYear: event.fiscal_year,
      status: event.status as KpiMasterEventStatus,
      isActive: event.is_active,
      createdAt: event.created_at.toISOString(),
      updatedAt: event.updated_at.toISOString(),
      createdBy: event.created_by || undefined,
      updatedBy: event.updated_by || undefined,
    };
  }
}
