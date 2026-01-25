import { Injectable } from '@nestjs/common';
import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import { MetricRepository } from '../repositories/metric.repository';
import {
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiType } from '@epm-sdd/contracts/shared/enums/kpi';
import { KpiMasterEventStatus } from '@epm-sdd/contracts/shared/enums/kpi';
import {
  KpiMasterItemNotFoundError,
  KpiMasterItemAccessDeniedError,
  KpiMasterItemInvalidReferenceError,
  KpiMasterItemDeleteForbiddenError,
  KpiManagedSubjectNotFoundError,
  KpiManagedMetricNotFoundError,
} from '@epm-sdd/contracts/shared/errors';

/**
 * KpiMasterItemService
 *
 * Purpose:
 * - Domain is the source of truth for business rules (BFF/UI are prohibited)
 * - Responsible for KPI item CRUD, type constraints, permission checks, and audit logging
 *
 * Business Rules:
 * - KPI item creation supports 3 types (FINANCIAL/NON_FINANCIAL/METRIC)
 * - Type and reference cannot be changed after creation
 * - Deletion prohibited if event status is CONFIRMED
 * - Reference validity check (kpi_managed=true for subjects/metrics)
 * - Department-based access control
 */
@Injectable()
export class KpiMasterItemService {
  constructor(
    private readonly itemRepository: KpiMasterItemRepository,
    private readonly eventRepository: KpiMasterEventRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly metricRepository: MetricRepository,
  ) {}

  /**
   * Find all KPI master items with filters and pagination
   *
   * Permission Check:
   * - Admin (epm.kpi.admin): Can view all items
   * - Company-wide KPI (department_stable_id = NULL): All users can view
   * - Department KPI: Check if user's control_department_stable_ids includes item's department_stable_id
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters
   * @param userPermissions - User permissions for access control (optional in Phase 1)
   * @returns Paginated list of KPI items
   */
  async findAll(
    tenantId: string,
    filters: GetKpiMasterItemsApiQueryDto,
    userPermissions?: {
      hasAdminPermission: boolean;
      controlDepartmentStableIds: string[];
    },
  ): Promise<{ data: KpiMasterItemApiDto[]; total: number }> {
    const result = await this.itemRepository.findAll(tenantId, filters);

    // TODO: Apply department-based access control filter
    // If not admin, filter items based on control_department_stable_ids
    // For Phase 1, this filter logic can be implemented when permission service is available

    return result;
  }

  /**
   * Find KPI master item by ID
   *
   * Permission Check:
   * - Same as findAll
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @param userPermissions - User permissions for access control (optional in Phase 1)
   * @returns KPI item or throws error if not found/access denied
   */
  async findById(
    tenantId: string,
    id: string,
    userPermissions?: {
      hasAdminPermission: boolean;
      controlDepartmentStableIds: string[];
    },
  ): Promise<KpiMasterItemApiDto> {
    const item = await this.itemRepository.findById(tenantId, id);

    if (!item) {
      throw new KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
    }

    // TODO: Apply department-based access control check
    // Check if user has permission to view this item
    // if (!hasAdminPermission && item.departmentStableId &&
    //     !controlDepartmentStableIds.includes(item.departmentStableId)) {
    //   throw new KpiMasterItemAccessDeniedError(`Access denied to KPI item: ${id}`);
    // }

    return item;
  }

  /**
   * Find all KPI master items by event ID
   *
   * @param tenantId - Tenant ID (required)
   * @param eventId - KPI event ID
   * @returns Array of KPI items for the event
   */
  async findByEventId(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]> {
    return this.itemRepository.findByEventId(tenantId, eventId);
  }

  /**
   * Create new KPI master item
   *
   * Business Rules:
   * - Type-specific reference validation:
   *   - FINANCIAL: Must have refSubjectId (and subject.kpi_managed=true)
   *   - NON_FINANCIAL: Must have refKpiDefinitionId
   *   - METRIC: Must have refMetricId (and metric.kpi_managed=true)
   * - Audit trail recorded (created_by via audit log)
   *
   * @param tenantId - Tenant ID (required)
   * @param data - KPI item creation data
   * @param userId - User ID for audit trail
   * @returns Created KPI item
   * @throws KpiMasterItemInvalidReferenceError if reference validation fails
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterItemApiDto,
    userId?: string,
  ): Promise<KpiMasterItemApiDto> {
    // Business Rule: Validate type-specific references
    await this.validateTypeReferences(tenantId, data.kpiType, {
      refSubjectId: data.refSubjectId,
      refKpiDefinitionId: data.refKpiDefinitionId,
      refMetricId: data.refMetricId,
    });

    // Create KPI item
    const item = await this.itemRepository.create(tenantId, data);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CREATE_KPI_ITEM',
    //   resourceId: item.id,
    //   resourceType: 'kpi_master_items',
    // });

    return item;
  }

  /**
   * Update KPI master item
   *
   * Business Rules:
   * - Type and reference fields cannot be changed (immutable after creation)
   * - Only metadata can be updated (kpiName, departmentStableId, ownerEmployeeId, sortOrder)
   * - Audit trail recorded (updated_by via audit log)
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @param data - KPI item update data
   * @param userId - User ID for audit trail
   * @returns Updated KPI item
   * @throws KpiMasterItemNotFoundError if item not found
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiMasterItemApiDto,
    userId?: string,
  ): Promise<KpiMasterItemApiDto> {
    // Check if item exists
    const existing = await this.itemRepository.findById(tenantId, id);
    if (!existing) {
      throw new KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
    }

    // Update KPI item (only allowed fields)
    const updated = await this.itemRepository.update(tenantId, id, data);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'UPDATE_KPI_ITEM',
    //   resourceId: id,
    //   resourceType: 'kpi_master_items',
    // });

    return updated!;
  }

  /**
   * Delete KPI master item (logical delete)
   *
   * Business Rules:
   * - Deletion prohibited if event status is CONFIRMED
   * - Logical delete only (is_active = false)
   * - Audit trail recorded
   *
   * @param tenantId - Tenant ID (required)
   * @param id - KPI item ID
   * @param userId - User ID for audit trail
   * @throws KpiMasterItemNotFoundError if item not found
   * @throws KpiMasterItemDeleteForbiddenError if event is CONFIRMED
   */
  async delete(tenantId: string, id: string, userId?: string): Promise<void> {
    // Check if item exists
    const item = await this.itemRepository.findById(tenantId, id);
    if (!item) {
      throw new KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
    }

    // Business Rule: Check if event is CONFIRMED
    const event = await this.eventRepository.findById(tenantId, item.kpiEventId);
    if (event && event.status === KpiMasterEventStatus.CONFIRMED) {
      throw new KpiMasterItemDeleteForbiddenError(
        `Cannot delete KPI item: event is CONFIRMED (${event.eventCode})`,
      );
    }

    // Logical delete
    await this.itemRepository.delete(tenantId, id);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'DELETE_KPI_ITEM',
    //   resourceId: id,
    //   resourceType: 'kpi_master_items',
    // });
  }

  /**
   * Validate type-specific reference requirements
   *
   * Business Rules:
   * - FINANCIAL: refSubjectId required, subject.kpi_managed=true
   * - NON_FINANCIAL: refKpiDefinitionId required
   * - METRIC: refMetricId required, metric.kpi_managed=true
   *
   * @param tenantId - Tenant ID
   * @param kpiType - KPI type
   * @param refs - Reference IDs
   * @throws KpiMasterItemInvalidReferenceError if validation fails
   */
  private async validateTypeReferences(
    tenantId: string,
    kpiType: KpiType,
    refs: {
      refSubjectId?: string;
      refKpiDefinitionId?: string;
      refMetricId?: string;
    },
  ): Promise<void> {
    switch (kpiType) {
      case KpiType.FINANCIAL:
        if (!refs.refSubjectId) {
          throw new KpiMasterItemInvalidReferenceError(
            'FINANCIAL KPI requires refSubjectId',
          );
        }
        // Business Rule: Verify subject exists and kpi_managed=true
        const subject = await this.subjectRepository.findById(tenantId, refs.refSubjectId);
        if (!subject) {
          throw new KpiManagedSubjectNotFoundError(
            `Subject not found: ${refs.refSubjectId}`,
          );
        }
        if (!subject.kpiManaged) {
          throw new KpiManagedSubjectNotFoundError(
            `Subject kpi_managed=false: ${subject.subjectCode} (${subject.subjectName})`,
          );
        }
        break;

      case KpiType.NON_FINANCIAL:
        if (!refs.refKpiDefinitionId) {
          throw new KpiMasterItemInvalidReferenceError(
            'NON_FINANCIAL KPI requires refKpiDefinitionId',
          );
        }
        break;

      case KpiType.METRIC:
        if (!refs.refMetricId) {
          throw new KpiMasterItemInvalidReferenceError('METRIC KPI requires refMetricId');
        }
        // Business Rule: Verify metric exists and kpi_managed=true
        const metric = await this.metricRepository.findById(tenantId, refs.refMetricId);
        if (!metric) {
          throw new KpiManagedMetricNotFoundError(
            `Metric not found: ${refs.refMetricId}`,
          );
        }
        if (!metric.kpiManaged) {
          throw new KpiManagedMetricNotFoundError(
            `Metric kpi_managed=false: ${metric.metricCode} (${metric.metricName})`,
          );
        }
        break;

      default:
        throw new KpiMasterItemInvalidReferenceError(`Invalid KPI type: ${kpiType}`);
    }
  }
}
