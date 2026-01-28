/**
 * KPI Master Event Repository
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
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  UpdateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
} from '@epm/contracts/api/kpi-master';

@Injectable()
export class KpiMasterEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI管理イベント一覧取得
   */
  async findAll(
    tenantId: string,
    query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id' | 'company_id'> & {
      company_id: string;
    },
  ): Promise<{ items: KpiMasterEventApiDto[]; total: number }> {
    await this.prisma.setTenantContext(tenantId);

    const {
      company_id,
      offset = 0,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'desc',
      keyword,
      fiscal_year,
      status,
    } = query;

    // WHERE条件構築
    const where: any = {
      tenant_id: tenantId,
      company_id,
      is_active: true,
    };

    if (keyword) {
      where.OR = [
        { event_code: { contains: keyword, mode: 'insensitive' } },
        { event_name: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (fiscal_year !== undefined) {
      where.fiscal_year = fiscal_year;
    }

    if (status) {
      where.status = status;
    }

    // Count
    const total = await this.prisma.kpi_master_events.count({ where });

    // Find
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    const events = await this.prisma.kpi_master_events.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    });

    return {
      items: events.map((e) => this.mapToApiDto(e)),
      total,
    };
  }

  /**
   * KPI管理イベント取得
   */
  async findById(
    tenantId: string,
    id: string,
  ): Promise<KpiMasterEventApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const event = await this.prisma.kpi_master_events.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        is_active: true,
      },
    });

    return event ? this.mapToApiDto(event) : null;
  }

  /**
   * event_code重複チェック
   */
  async findByEventCode(
    tenantId: string,
    companyId: string,
    eventCode: string,
  ): Promise<KpiMasterEventApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const event = await this.prisma.kpi_master_events.findFirst({
      where: {
        tenant_id: tenantId,
        company_id: companyId,
        event_code: eventCode,
        is_active: true,
      },
    });

    return event ? this.mapToApiDto(event) : null;
  }

  /**
   * KPI管理イベント作成
   */
  async create(
    tenantId: string,
    data: CreateKpiMasterEventApiDto & { created_by?: string },
  ): Promise<KpiMasterEventApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const event = await this.prisma.kpi_master_events.create({
      data: {
        tenant_id: tenantId,
        company_id: data.company_id,
        event_code: data.event_code,
        event_name: data.event_name,
        fiscal_year: data.fiscal_year,
        status: 'DRAFT',
        is_active: true,
        created_by: data.created_by,
        updated_by: data.created_by,
      },
    });

    return this.mapToApiDto(event);
  }

  /**
   * KPI管理イベント更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiMasterEventApiDto & { updated_by?: string },
  ): Promise<KpiMasterEventApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const event = await this.prisma.kpi_master_events.update({
      where: {
        tenant_id: tenantId,
        id,
      },
      data: {
        event_name: data.event_name,
        status: data.status,
        updated_by: data.updated_by,
      },
    });

    return this.mapToApiDto(event);
  }

  /**
   * Prisma model → API DTO 変換
   */
  private mapToApiDto(event: any): KpiMasterEventApiDto {
    return {
      id: event.id,
      tenant_id: event.tenant_id,
      company_id: event.company_id,
      event_code: event.event_code,
      event_name: event.event_name,
      fiscal_year: event.fiscal_year,
      status: event.status,
      is_active: event.is_active,
      created_at: event.created_at.toISOString(),
      updated_at: event.updated_at.toISOString(),
      created_by: event.created_by,
      updated_by: event.updated_by,
    };
  }
}
