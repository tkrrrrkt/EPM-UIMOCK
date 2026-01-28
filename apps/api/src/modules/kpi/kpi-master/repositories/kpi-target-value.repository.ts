/**
 * KPI Target Value Repository
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
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
  UpdateKpiTargetValueApiDto,
} from '@epm/contracts/api/kpi-master';

@Injectable()
export class KpiTargetValueRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI項目の目標値一覧取得
   */
  async findByItemId(
    tenantId: string,
    kpiMasterItemId: string,
  ): Promise<KpiTargetValueApiDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const targetValues = await this.prisma.kpi_target_values.findMany({
      where: {
        tenant_id: tenantId,
        kpi_master_item_id: kpiMasterItemId,
      },
      orderBy: [{ period_code: 'asc' }],
    });

    return targetValues.map((tv) => this.mapToApiDto(tv));
  }

  /**
   * 期間別目標値取得（重複チェック用）
   */
  async findByPeriod(
    tenantId: string,
    kpiMasterItemId: string,
    periodCode: string,
  ): Promise<KpiTargetValueApiDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const targetValue = await this.prisma.kpi_target_values.findFirst({
      where: {
        tenant_id: tenantId,
        kpi_master_item_id: kpiMasterItemId,
        period_code: periodCode,
      },
    });

    return targetValue ? this.mapToApiDto(targetValue) : null;
  }

  /**
   * 目標値作成
   */
  async create(
    tenantId: string,
    data: CreateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const targetValue = await this.prisma.kpi_target_values.create({
      data: {
        tenant_id: tenantId,
        kpi_master_item_id: data.kpi_master_item_id,
        period_code: data.period_code,
        target_value: data.target_value,
      },
    });

    return this.mapToApiDto(targetValue);
  }

  /**
   * 目標値更新
   */
  async update(
    tenantId: string,
    id: string,
    data: UpdateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    await this.prisma.setTenantContext(tenantId);

    const targetValue = await this.prisma.kpi_target_values.update({
      where: {
        tenant_id: tenantId,
        id,
      },
      data: {
        target_value: data.target_value,
      },
    });

    return this.mapToApiDto(targetValue);
  }

  /**
   * Prisma model → API DTO 変換
   */
  private mapToApiDto(targetValue: any): KpiTargetValueApiDto {
    return {
      id: targetValue.id,
      tenant_id: targetValue.tenant_id,
      kpi_master_item_id: targetValue.kpi_master_item_id,
      period_code: targetValue.period_code,
      target_value: parseFloat(targetValue.target_value.toString()),
      created_at: targetValue.created_at.toISOString(),
      updated_at: targetValue.updated_at.toISOString(),
    };
  }
}
