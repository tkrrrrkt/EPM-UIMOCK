/**
 * KPI Fact Amount Repository
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
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
  UpdateKpiFactAmountApiDto,
} from '@epm/contracts/api/kpi-master';

@Injectable()
export class KpiFactAmountRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI定義×イベント×部門での予実データ取得
   */
  async findByItemId(
    tenantId: string,
    kpiDefinitionId: string,
    eventId: string,
    departmentStableId?: string,
  ): Promise<KpiFactAmountApiDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const where: any = {
      tenant_id: tenantId,
      kpi_definition_id: kpiDefinitionId,
      kpi_event_id: eventId,
    };

    if (departmentStableId) {
      where.department_stable_id = departmentStableId;
    }

    const factAmounts = await this.prisma.kpi_fact_amounts.findMany({
      where,
      orderBy: [{ period_start_date: 'asc' }],
    });

    return factAmounts.map((fa) => this.mapToApiDto(fa));
  }

  /**
   * 期間別予実データ取得（重複チェック用）
   */
  async findByPeriod(
    tenantId: string,
    eventId: string,
    kpiDefinitionId: string,
    periodCode: string,
    departmentStableId?: string,
  ): Promise<KpiFactAmountApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const where: any = {
      tenant_id: tenantId,
      kpi_event_id: eventId,
      kpi_definition_id: kpiDefinitionId,
      period_code: periodCode,
    };

    if (departmentStableId) {
      where.department_stable_id = departmentStableId;
    } else {
      where.department_stable_id = null;
    }

    const factAmount = await this.prisma.kpi_fact_amounts.findFirst({
      where,
    });

    return factAmount ? this.mapToApiDto(factAmount) : null;
  }

  /**
   * 予実データ作成
   */
  async create(
    tenantId: string,
    data: CreateKpiFactAmountApiDto & {
      company_id: string;
      created_by?: string;
    },
  ): Promise<KpiFactAmountApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const factAmount = await this.prisma.kpi_fact_amounts.create({
      data: {
        tenant_id: tenantId,
        company_id: data.company_id,
        kpi_event_id: data.event_id,
        kpi_definition_id: data.kpi_definition_id,
        period_code: data.period_code,
        period_start_date: data.period_start_date
          ? new Date(data.period_start_date)
          : null,
        period_end_date: data.period_end_date
          ? new Date(data.period_end_date)
          : null,
        target_value: data.target_value,
        actual_value: data.actual_value,
        department_stable_id: data.department_stable_id,
        notes: data.notes,
        created_by: data.created_by,
        updated_by: data.created_by,
      },
    });

    return this.mapToApiDto(factAmount);
  }

  /**
   * 予実データ更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiFactAmountApiDto & { updated_by?: string },
  ): Promise<KpiFactAmountApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const factAmount = await this.prisma.kpi_fact_amounts.update({
      where: {
        tenant_id: tenantId,
        id,
      },
      data: {
        target_value: data.target_value,
        actual_value: data.actual_value,
        notes: data.notes,
        updated_by: data.updated_by,
      },
    });

    return this.mapToApiDto(factAmount);
  }

  /**
   * Prisma model → API DTO 変換
   */
  private mapToApiDto(factAmount: any): KpiFactAmountApiDto {
    return {
      id: factAmount.id,
      tenant_id: factAmount.tenant_id,
      company_id: factAmount.company_id,
      event_id: factAmount.kpi_event_id,
      kpi_definition_id: factAmount.kpi_definition_id,
      period_code: factAmount.period_code,
      period_start_date: factAmount.period_start_date
        ? factAmount.period_start_date.toISOString().split('T')[0]
        : undefined,
      period_end_date: factAmount.period_end_date
        ? factAmount.period_end_date.toISOString().split('T')[0]
        : undefined,
      target_value: factAmount.target_value
        ? parseFloat(factAmount.target_value.toString())
        : undefined,
      actual_value: factAmount.actual_value
        ? parseFloat(factAmount.actual_value.toString())
        : undefined,
      department_stable_id: factAmount.department_stable_id,
      notes: factAmount.notes,
      created_at: factAmount.created_at.toISOString(),
      updated_at: factAmount.updated_at.toISOString(),
      created_by: factAmount.created_by,
      updated_by: factAmount.updated_by,
    };
  }
}
