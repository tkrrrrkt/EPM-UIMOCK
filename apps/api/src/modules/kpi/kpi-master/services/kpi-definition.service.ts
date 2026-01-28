/**
 * KPI Definition Service
 *
 * @module kpi/kpi-master
 *
 * Business Rules:
 * - kpi_code は company 内で一意
 * - 非財務KPI定義の作成・取得のみ（更新・削除は Phase 1 対象外）
 * - 作成時に監査ログを記録
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Service Specification)
 */
import { Injectable } from '@nestjs/common';
import { KpiDefinitionRepository } from '../repositories/kpi-definition.repository';
import type {
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
  GetKpiDefinitionsApiQueryDto,
} from '@epm/contracts/api/kpi-master';
import { KpiDefinitionDuplicateError } from '@epm/contracts/shared/errors';

@Injectable()
export class KpiDefinitionService {
  constructor(
    private readonly kpiDefinitionRepository: KpiDefinitionRepository,
  ) {}

  /**
   * 非財務KPI定義一覧取得
   */
  async findAllDefinitions(
    tenantId: string,
    query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id'>,
  ): Promise<{ items: KpiDefinitionApiDto[]; total: number }> {
    return this.kpiDefinitionRepository.findAll(tenantId, query);
  }

  /**
   * 非財務KPI定義作成
   *
   * ビジネスルール:
   * - kpi_code 重複チェック（company 内）
   */
  async createDefinition(
    tenantId: string,
    userId: string,
    data: Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'> & {
      company_id: string;
    },
  ): Promise<KpiDefinitionApiDto> {
    // kpi_code 重複チェック
    const existingDefinition =
      await this.kpiDefinitionRepository.findByKpiCode(
        tenantId,
        data.company_id,
        data.kpi_code,
      );

    if (existingDefinition) {
      throw new KpiDefinitionDuplicateError(
        `KPI code already exists: ${data.kpi_code}`,
      );
    }

    // 定義作成
    const definition = await this.kpiDefinitionRepository.create(tenantId, {
      tenant_id: tenantId,
      company_id: data.company_id,
      kpi_code: data.kpi_code,
      kpi_name: data.kpi_name,
      description: data.description,
      unit: data.unit,
      aggregation_method: data.aggregation_method,
      direction: data.direction,
      created_by: userId,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_definition.create', { definitionId: definition.id, userId });

    return definition;
  }
}
