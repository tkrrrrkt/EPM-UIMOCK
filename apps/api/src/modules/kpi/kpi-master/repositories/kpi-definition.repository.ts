/**
 * KPI Definition Repository
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
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
  GetKpiDefinitionsApiQueryDto,
} from '@epm/contracts/api/kpi-master';

@Injectable()
export class KpiDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 非財務KPI定義一覧取得
   */
  async findAll(
    tenantId: string,
    query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id'>,
  ): Promise<{ items: KpiDefinitionApiDto[]; total: number }> {
    await this.prisma.setTenantContext(tenantId);

    const {
      company_id,
      offset = 0,
      limit = 50,
      sort_by = 'kpi_code',
      sort_order = 'asc',
      keyword,
    } = query;

    // WHERE条件構築
    const where: any = {
      tenant_id: tenantId,
      company_id,
      is_active: true,
    };

    if (keyword) {
      where.OR = [
        { kpi_code: { contains: keyword, mode: 'insensitive' } },
        { kpi_name: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Count
    const total = await this.prisma.kpi_definitions.count({ where });

    // Find
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    const definitions = await this.prisma.kpi_definitions.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    });

    return {
      items: definitions.map((d) => this.mapToApiDto(d)),
      total,
    };
  }

  /**
   * 非財務KPI定義取得
   */
  async findById(
    tenantId: string,
    id: string,
  ): Promise<KpiDefinitionApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const definition = await this.prisma.kpi_definitions.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        is_active: true,
      },
    });

    return definition ? this.mapToApiDto(definition) : null;
  }

  /**
   * kpi_code重複チェック
   */
  async findByKpiCode(
    tenantId: string,
    companyId: string,
    kpiCode: string,
  ): Promise<KpiDefinitionApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const definition = await this.prisma.kpi_definitions.findFirst({
      where: {
        tenant_id: tenantId,
        company_id: companyId,
        kpi_code: kpiCode,
        is_active: true,
      },
    });

    return definition ? this.mapToApiDto(definition) : null;
  }

  /**
   * 非財務KPI定義作成
   */
  async create(
    tenantId: string,
    data: CreateKpiDefinitionApiDto & { created_by?: string },
  ): Promise<KpiDefinitionApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const definition = await this.prisma.kpi_definitions.create({
      data: {
        tenant_id: tenantId,
        company_id: data.company_id,
        kpi_code: data.kpi_code,
        kpi_name: data.kpi_name,
        description: data.description,
        unit: data.unit,
        aggregation_method: data.aggregation_method,
        direction: data.direction,
        is_active: true,
        created_by: data.created_by,
        updated_by: data.created_by,
      },
    });

    return this.mapToApiDto(definition);
  }

  /**
   * Prisma model → API DTO 変換
   */
  private mapToApiDto(definition: any): KpiDefinitionApiDto {
    return {
      id: definition.id,
      tenant_id: definition.tenant_id,
      company_id: definition.company_id,
      kpi_code: definition.kpi_code,
      kpi_name: definition.kpi_name,
      description: definition.description,
      unit: definition.unit,
      aggregation_method: definition.aggregation_method,
      direction: definition.direction,
      is_active: definition.is_active,
      created_at: definition.created_at.toISOString(),
      updated_at: definition.updated_at.toISOString(),
      created_by: definition.created_by,
      updated_by: definition.updated_by,
    };
  }
}
