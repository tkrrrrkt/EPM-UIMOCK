/**
 * KPI Target Value Service
 *
 * @module kpi/kpi-master
 *
 * Business Rules:
 * - 期間別目標値データ（指標KPI用）
 * - kpi_master_item_id + period_code の組み合わせで一意
 * - target_value の更新可能
 * - 作成・更新時に監査ログを記録
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Service Specification)
 */
import { Injectable } from '@nestjs/common';
import { KpiTargetValueRepository } from '../repositories/kpi-target-value.repository';
import type {
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
  UpdateKpiTargetValueApiDto,
} from '@epm/contracts/api/kpi-master';
import {
  KpiTargetValueDuplicateError,
  KpiTargetValueNotFoundError,
} from '@epm/contracts/shared/errors';

@Injectable()
export class KpiTargetValueService {
  constructor(
    private readonly kpiTargetValueRepository: KpiTargetValueRepository,
  ) {}

  /**
   * 期間別目標値取得
   */
  async findByItemId(
    tenantId: string,
    kpiMasterItemId: string,
  ): Promise<KpiTargetValueApiDto[]> {
    return this.kpiTargetValueRepository.findByItemId(tenantId, kpiMasterItemId);
  }

  /**
   * 目標値作成
   *
   * ビジネスルール:
   * - 期間重複チェック（kpi_master_item_id + period_code）
   */
  async createTargetValue(
    tenantId: string,
    data: Omit<CreateKpiTargetValueApiDto, 'tenant_id'>,
  ): Promise<KpiTargetValueApiDto> {
    // 期間重複チェック
    const existingTargetValue =
      await this.kpiTargetValueRepository.findByPeriod(
        tenantId,
        data.kpi_master_item_id,
        data.period_code,
      );

    if (existingTargetValue) {
      throw new KpiTargetValueDuplicateError(
        `Target value already exists for period: ${data.period_code}`,
      );
    }

    // 目標値作成
    const targetValue = await this.kpiTargetValueRepository.create(tenantId, {
      tenant_id: tenantId,
      kpi_master_item_id: data.kpi_master_item_id,
      period_code: data.period_code,
      target_value: data.target_value,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_target_value.create', { targetValueId: targetValue.id });

    return targetValue;
  }

  /**
   * 目標値更新
   */
  async updateTargetValue(
    tenantId: string,
    id: string,
    data: UpdateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    // 目標値更新
    const targetValue = await this.kpiTargetValueRepository.update(
      tenantId,
      id,
      {
        target_value: data.target_value,
      },
    );

    // TODO: 監査ログ記録
    // auditLog.record('kpi_target_value.update', { targetValueId: id });

    return targetValue;
  }
}
