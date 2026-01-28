/**
 * KPI Fact Amount Service
 *
 * @module kpi/kpi-master
 *
 * Business Rules:
 * - 期間別予実データ（非財務KPI用）
 * - event_id + kpi_definition_id + period_code + department_stable_id の組み合わせで一意
 * - target_value、actual_value の更新可能
 * - 作成・更新時に監査ログを記録
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Service Specification)
 */
import { Injectable } from '@nestjs/common';
import { KpiFactAmountRepository } from '../repositories/kpi-fact-amount.repository';
import type {
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
  UpdateKpiFactAmountApiDto,
} from '@epm/contracts/api/kpi-master';
import {
  KpiFactAmountDuplicateError,
  KpiFactAmountNotFoundError,
} from '@epm/contracts/shared/errors';

@Injectable()
export class KpiFactAmountService {
  constructor(
    private readonly kpiFactAmountRepository: KpiFactAmountRepository,
  ) {}

  /**
   * 期間別予実データ取得
   */
  async findByItemId(
    tenantId: string,
    kpiDefinitionId: string,
    eventId: string,
    departmentStableId?: string,
  ): Promise<KpiFactAmountApiDto[]> {
    return this.kpiFactAmountRepository.findByItemId(
      tenantId,
      kpiDefinitionId,
      eventId,
      departmentStableId,
    );
  }

  /**
   * 予実データ作成
   *
   * ビジネスルール:
   * - 期間重複チェック（event_id + kpi_definition_id + period_code + department_stable_id）
   */
  async createFactAmount(
    tenantId: string,
    userId: string,
    data: Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'> & {
      company_id: string;
    },
  ): Promise<KpiFactAmountApiDto> {
    // 期間重複チェック
    const existingFactAmount =
      await this.kpiFactAmountRepository.findByPeriod(
        tenantId,
        data.event_id,
        data.kpi_definition_id,
        data.period_code,
        data.department_stable_id,
      );

    if (existingFactAmount) {
      throw new KpiFactAmountDuplicateError(
        `Fact amount already exists for period: ${data.period_code}`,
      );
    }

    // 予実データ作成
    const factAmount = await this.kpiFactAmountRepository.create(tenantId, {
      tenant_id: tenantId,
      event_id: data.event_id,
      kpi_definition_id: data.kpi_definition_id,
      department_stable_id: data.department_stable_id,
      period_code: data.period_code,
      period_start_date: data.period_start_date,
      period_end_date: data.period_end_date,
      target_value: data.target_value,
      actual_value: data.actual_value,
      notes: data.notes,
      company_id: data.company_id,
      created_by: userId,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_fact_amount.create', { factAmountId: factAmount.id, userId });

    return factAmount;
  }

  /**
   * 予実データ更新
   */
  async updateFactAmount(
    tenantId: string,
    id: string,
    userId: string,
    data: Omit<UpdateKpiFactAmountApiDto, 'updated_by'>,
  ): Promise<KpiFactAmountApiDto> {
    // 予実データ更新
    const factAmount = await this.kpiFactAmountRepository.update(tenantId, id, {
      target_value: data.target_value,
      actual_value: data.actual_value,
      notes: data.notes,
      updated_by: userId,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_fact_amount.update', { factAmountId: id, userId });

    return factAmount;
  }
}
