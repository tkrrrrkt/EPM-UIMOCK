import { Injectable } from '@nestjs/common';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiMasterEventStatus } from '@epm-sdd/contracts/shared/enums/kpi';
import {
  KpiMasterEventDuplicateError,
  KpiMasterEventNotFoundError,
  KpiMasterEventAlreadyConfirmedError,
} from '@epm-sdd/contracts/shared/errors';

/**
 * KpiMasterEventService
 *
 * Purpose:
 * - Domain is the source of truth for business rules (BFF/UI are prohibited)
 * - Responsible for KPI event state transitions, duplicate checks, permission checks, and audit logging
 *
 * Business Rules:
 * - Event creation starts in DRAFT status
 * - Event confirmation transitions DRAFT → CONFIRMED
 * - event_code duplicate check within company scope
 * - Audit logging for all CUD operations
 */
@Injectable()
export class KpiMasterEventService {
  constructor(private readonly eventRepository: KpiMasterEventRepository) {}

  /**
   * Find all KPI master events with filters and pagination
   *
   * @param tenantId - Tenant ID (required)
   * @param filters - Query filters
   * @returns Paginated list of KPI events
   */
  async findAll(
    tenantId: string,
    filters: GetKpiMasterEventsApiQueryDto,
  ): Promise<{ data: KpiMasterEventApiDto[]; total: number }> {
    return this.eventRepository.findAll(tenantId, filters);
  }

  /**
   * Find KPI master event by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Event ID
   * @returns KPI event or throws error if not found
   */
  async findById(tenantId: string, id: string): Promise<KpiMasterEventApiDto> {
    const event = await this.eventRepository.findById(tenantId, id);

    if (!event) {
      throw new KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
    }

    return event;
  }

  /**
   * Create new KPI master event
   *
   * Business Rules:
   * - event_code must be unique within company scope
   * - Created with DRAFT status
   * - Audit trail recorded (created_by)
   *
   * @param tenantId - Tenant ID (required)
   * @param data - Event creation data
   * @param userId - User ID for audit trail
   * @returns Created KPI event
   * @throws KpiMasterEventDuplicateError if event_code already exists
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterEventApiDto,
    userId?: string,
  ): Promise<KpiMasterEventApiDto> {
    // Business Rule: Check for duplicate event_code within company scope
    const existing = await this.eventRepository.findByEventCode(
      tenantId,
      data.companyId,
      data.eventCode,
    );

    if (existing) {
      throw new KpiMasterEventDuplicateError(
        `Event code already exists: ${data.eventCode} in company ${data.companyId}`,
      );
    }

    // Create event with DRAFT status
    const event = await this.eventRepository.create(tenantId, data, userId);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CREATE_KPI_EVENT',
    //   resourceId: event.id,
    //   resourceType: 'kpi_master_events',
    // });

    return event;
  }

  /**
   * Update KPI master event
   *
   * Business Rules:
   * - event_code uniqueness checked if changed
   * - Status transitions validated
   * - Audit trail recorded (updated_by)
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Event ID
   * @param data - Event update data
   * @param userId - User ID for audit trail
   * @returns Updated KPI event
   * @throws KpiMasterEventNotFoundError if event not found
   * @throws KpiMasterEventDuplicateError if event_code already exists
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<CreateKpiMasterEventApiDto>,
    userId?: string,
  ): Promise<KpiMasterEventApiDto> {
    // Check if event exists
    const existing = await this.eventRepository.findById(tenantId, id);
    if (!existing) {
      throw new KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
    }

    // Business Rule: Check for duplicate event_code if being changed
    if (data.eventCode && data.eventCode !== existing.eventCode) {
      const duplicate = await this.eventRepository.findByEventCode(
        tenantId,
        data.companyId || existing.companyId,
        data.eventCode,
      );

      if (duplicate && duplicate.id !== id) {
        throw new KpiMasterEventDuplicateError(
          `Event code already exists: ${data.eventCode}`,
        );
      }
    }

    // Update event
    const updated = await this.eventRepository.update(tenantId, id, data, userId);

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'UPDATE_KPI_EVENT',
    //   resourceId: id,
    //   resourceType: 'kpi_master_events',
    // });

    return updated!;
  }

  /**
   * Confirm KPI master event (status transition DRAFT → CONFIRMED)
   *
   * Business Rules:
   * - Only DRAFT events can be confirmed
   * - Confirmation is irreversible
   * - Audit trail recorded
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Event ID
   * @param userId - User ID for audit trail
   * @returns Confirmed KPI event
   * @throws KpiMasterEventNotFoundError if event not found
   * @throws KpiMasterEventAlreadyConfirmedError if not in DRAFT status
   */
  async confirm(tenantId: string, id: string, userId?: string): Promise<KpiMasterEventApiDto> {
    // Check if event exists
    const existing = await this.eventRepository.findById(tenantId, id);
    if (!existing) {
      throw new KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
    }

    // Business Rule: Only DRAFT events can be confirmed
    if (existing.status !== KpiMasterEventStatus.DRAFT) {
      throw new KpiMasterEventAlreadyConfirmedError(
        `Cannot confirm event in ${existing.status} status. Only DRAFT events can be confirmed.`,
      );
    }

    // Update status to CONFIRMED
    const updated = await this.eventRepository.update(
      tenantId,
      id,
      { status: KpiMasterEventStatus.CONFIRMED },
      userId,
    );

    // TODO: Record audit log
    // await this.auditLogService.log({
    //   tenantId,
    //   userId,
    //   action: 'CONFIRM_KPI_EVENT',
    //   resourceId: id,
    //   resourceType: 'kpi_master_events',
    // });

    return updated!;
  }
}
