import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiType, HierarchyLevel } from '@epm-sdd/contracts/shared/enums/kpi';

/**
 * KpiMasterItemRepository
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
export class KpiMasterItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all KPI master items with filters and pagination
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters (kpiEventId, parentKpiItemId, kpiType, hierarchyLevel, keyword)
   * @param pagination - Pagination parameters (offset, limit, sortBy, sortOrder)
   * @returns Array of KPI master items matching filters
   */
  async findAll(
    tenantId: string,
    filters: GetKpiMasterItemsApiQueryDto,
  ): Promise<{ data: KpiMasterItemApiDto[]; total: number }> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Build WHERE clause (double-guard: RLS + application level)
    const where: any = {
      tenant_id: tenantId, // Required: tenant_id in WHERE clause
      is_active: true,
    };

    // Apply filters
    if (filters.eventId) {
      where.kpi_event_id = filters.eventId;
    }

    if (filters.parentKpiItemId !== undefined) {
      where.parent_kpi_item_id = filters.parentKpiItemId || null;
    }

    if (filters.kpiType) {
      where.kpi_type = filters.kpiType;
    }

    if (filters.hierarchyLevel !== undefined) {
      where.hierarchy_level = filters.hierarchyLevel;
    }

    if (filters.keyword) {
      where.OR = [
        { kpi_code: { contains: filters.keyword, mode: 'insensitive' } },
        { kpi_name: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    // Build ORDER BY clause
    const orderBy: any = {};
    const sortBy = filters.sortBy || 'sort_order';
    const sortOrder = filters.sortOrder || 'asc';

    // Map sortBy to database column names
    const sortByMap: Record<string, string> = {
      kpi_code: 'kpi_code',
      kpi_name: 'kpi_name',
      sort_order: 'sort_order',
      created_at: 'created_at',
    };

    orderBy[sortByMap[sortBy] || 'sort_order'] = sortOrder;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.prisma.kpi_master_items.findMany({
        where,
        orderBy,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.kpi_master_items.count({ where }),
    ]);

    // Map to API DTO
    return {
      data: data.map((item) => this.mapToApiDto(item)),
      total,
    };
  }

  /**
   * Find KPI master item by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @returns KPI master item or null if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiMasterItemApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const item = await this.prisma.kpi_master_items.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    return item ? this.mapToApiDto(item) : null;
  }

  /**
   * Find all KPI master items by event ID
   *
   * @param tenantId - Tenant ID (required)
   * @param eventId - KPI event ID
   * @returns Array of KPI master items for the event
   */
  async findByEventId(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const items = await this.prisma.kpi_master_items.findMany({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        kpi_event_id: eventId,
        is_active: true,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return items.map((item) => this.mapToApiDto(item));
  }

  /**
   * Create new KPI master item
   *
   * @param tenantId - Tenant ID (required)
   * @param data - KPI item creation data
   * @returns Created KPI master item
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Create KPI item with tenant_id
    const item = await this.prisma.kpi_master_items.create({
      data: {
        tenant_id: tenantId, // Required: tenant_id for multi-tenant isolation
        kpi_event_id: data.kpiEventId,
        parent_kpi_item_id: data.parentKpiItemId,
        kpi_code: data.kpiCode,
        kpi_name: data.kpiName,
        kpi_type: data.kpiType,
        hierarchy_level: data.hierarchyLevel,
        ref_subject_id: data.refSubjectId,
        ref_kpi_definition_id: data.refKpiDefinitionId,
        ref_metric_id: data.refMetricId,
        department_stable_id: data.departmentStableId,
        owner_employee_id: data.ownerEmployeeId,
        sort_order: data.sortOrder ?? 1,
        is_active: true,
      },
    });

    return this.mapToApiDto(item);
  }

  /**
   * Update KPI master item
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @param data - KPI item update data
   * @returns Updated KPI master item or null if not found
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Check if item exists with tenant_id double-guard
    const existing = await this.prisma.kpi_master_items.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    if (!existing) {
      return null;
    }

    // Update KPI item
    const item = await this.prisma.kpi_master_items.update({
      where: { id },
      data: {
        ...(data.kpiName && { kpi_name: data.kpiName }),
        ...(data.departmentStableId !== undefined && {
          department_stable_id: data.departmentStableId,
        }),
        ...(data.ownerEmployeeId !== undefined && {
          owner_employee_id: data.ownerEmployeeId,
        }),
        ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
      },
    });

    return this.mapToApiDto(item);
  }

  /**
   * Delete KPI master item (logical delete)
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @returns true if deleted, false if not found
   */
  async delete(tenantId: string, id: string): Promise<boolean> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Check if item exists with tenant_id double-guard
    const existing = await this.prisma.kpi_master_items.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
    });

    if (!existing) {
      return false;
    }

    // Logical delete
    await this.prisma.kpi_master_items.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    return true;
  }

  /**
   * Map Prisma model to API DTO
   *
   * @param item - Prisma kpi_master_items model
   * @returns KpiMasterItemApiDto
   */
  private mapToApiDto(item: any): KpiMasterItemApiDto {
    return {
      id: item.id,
      kpiEventId: item.kpi_event_id,
      parentKpiItemId: item.parent_kpi_item_id || undefined,
      kpiCode: item.kpi_code,
      kpiName: item.kpi_name,
      kpiType: item.kpi_type as KpiType,
      hierarchyLevel: item.hierarchy_level as HierarchyLevel,
      refSubjectId: item.ref_subject_id || undefined,
      refKpiDefinitionId: item.ref_kpi_definition_id || undefined,
      refMetricId: item.ref_metric_id || undefined,
      departmentStableId: item.department_stable_id || undefined,
      ownerEmployeeId: item.owner_employee_id || undefined,
      sortOrder: item.sort_order,
      isActive: item.is_active,
      createdAt: item.created_at.toISOString(),
      updatedAt: item.updated_at.toISOString(),
    };
  }
}
