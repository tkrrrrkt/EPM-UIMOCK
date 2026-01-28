/**
 * KPI Master Item Repository
 *
 * @module kpi/kpi-master
 *
 * Repository Requirements:
 * - tenant_id required for all methods (RLS + application level double-guard)
 * - WHERE clause double-guard required
 * - set_config prerequisite (RLS enabled, no bypass)
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Repository Specification)
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
} from '@epm/contracts/api/kpi-master';

@Injectable()
export class KpiMasterItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI項目一覧取得
   */
  async findAll(
    tenantId: string,
    query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>,
  ): Promise<KpiMasterItemApiDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const {
      event_id,
      department_stable_ids,
      kpi_type,
      hierarchy_level,
    } = query;

    // WHERE条件構築
    const where: any = {
      tenant_id: tenantId,
      kpi_event_id: event_id,
      is_active: true,
    };

    if (department_stable_ids && department_stable_ids.length > 0) {
      where.department_stable_id = { in: department_stable_ids };
    }

    if (kpi_type) {
      where.kpi_type = kpi_type;
    }

    if (hierarchy_level !== undefined) {
      where.hierarchy_level = hierarchy_level;
    }

    const items = await this.prisma.kpi_master_items.findMany({
      where,
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
      orderBy: [{ hierarchy_level: 'asc' }, { sort_order: 'asc' }],
    });

    return items.map((item) => this.mapToApiDto(item));
  }

  /**
   * KPI項目取得
   */
  async findById(
    tenantId: string,
    id: string,
  ): Promise<KpiMasterItemApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const item = await this.prisma.kpi_master_items.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        is_active: true,
      },
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
    });

    return item ? this.mapToApiDto(item) : null;
  }

  /**
   * イベント内KPI項目一覧取得
   */
  async findByEventId(
    tenantId: string,
    eventId: string,
  ): Promise<KpiMasterItemApiDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const items = await this.prisma.kpi_master_items.findMany({
      where: {
        tenant_id: tenantId,
        kpi_event_id: eventId,
        is_active: true,
      },
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
      orderBy: [{ hierarchy_level: 'asc' }, { sort_order: 'asc' }],
    });

    return items.map((item) => this.mapToApiDto(item));
  }

  /**
   * kpi_code重複チェック（イベント内）
   */
  async findByKpiCode(
    tenantId: string,
    eventId: string,
    kpiCode: string,
  ): Promise<KpiMasterItemApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const item = await this.prisma.kpi_master_items.findFirst({
      where: {
        tenant_id: tenantId,
        kpi_event_id: eventId,
        kpi_code: kpiCode,
        is_active: true,
      },
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
    });

    return item ? this.mapToApiDto(item) : null;
  }

  /**
   * 子KPI項目の存在確認
   */
  async hasChildren(tenantId: string, parentId: string): Promise<boolean> {
    await this.prisma.setTenantContext(tenantId);

    const count = await this.prisma.kpi_master_items.count({
      where: {
        tenant_id: tenantId,
        parent_kpi_item_id: parentId,
        is_active: true,
      },
    });

    return count > 0;
  }

  /**
   * KPI項目作成
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const item = await this.prisma.kpi_master_items.create({
      data: {
        tenant_id: tenantId,
        kpi_event_id: data.event_id,
        parent_kpi_item_id: data.parent_kpi_item_id,
        kpi_code: data.kpi_code,
        kpi_name: data.kpi_name,
        kpi_type: data.kpi_type,
        hierarchy_level: data.hierarchy_level,
        ref_subject_id: data.ref_subject_id,
        ref_kpi_definition_id: data.ref_kpi_definition_id,
        ref_metric_id: data.ref_metric_id,
        department_stable_id: data.department_stable_id,
        owner_employee_id: data.owner_employee_id,
        sort_order: data.sort_order ?? 1,
        is_active: true,
      },
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
    });

    return this.mapToApiDto(item);
  }

  /**
   * KPI項目更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const item = await this.prisma.kpi_master_items.update({
      where: {
        tenant_id: tenantId,
        id,
      },
      data: {
        kpi_name: data.kpi_name,
        department_stable_id: data.department_stable_id,
        owner_employee_id: data.owner_employee_id,
        sort_order: data.sort_order,
      },
      include: {
        kpi_master_events: {
          select: { company_id: true },
        },
      },
    });

    return this.mapToApiDto(item);
  }

  /**
   * KPI項目削除（論理削除）
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await this.prisma.setTenantContext(tenantId);

    await this.prisma.kpi_master_items.update({
      where: {
        tenant_id: tenantId,
        id,
      },
      data: {
        is_active: false,
      },
    });
  }

  /**
   * Prisma model → API DTO 変換
   */
  private mapToApiDto(item: any): KpiMasterItemApiDto {
    return {
      id: item.id,
      tenant_id: item.tenant_id,
      company_id: item.kpi_master_events.company_id,
      event_id: item.kpi_event_id,
      parent_kpi_item_id: item.parent_kpi_item_id,
      kpi_code: item.kpi_code,
      kpi_name: item.kpi_name,
      kpi_type: item.kpi_type,
      hierarchy_level: item.hierarchy_level,
      ref_subject_id: item.ref_subject_id,
      ref_kpi_definition_id: item.ref_kpi_definition_id,
      ref_metric_id: item.ref_metric_id,
      department_stable_id: item.department_stable_id,
      owner_employee_id: item.owner_employee_id,
      sort_order: item.sort_order,
      is_active: item.is_active,
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    };
  }
}
