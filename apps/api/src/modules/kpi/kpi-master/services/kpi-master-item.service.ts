/**
 * KPI Master Item Service
 *
 * @module kpi/kpi-master
 *
 * Business Rules:
 * - kpi_code はイベント内で一意
 * - kpi_type による参照先制約（FINANCIAL→subjects, NON_FINANCIAL→kpi_definitions, METRIC→metrics）
 * - kpi_type と参照先IDは作成後変更不可
 * - 削除はCONFIRMED状態のイベント内では禁止
 * - 部門別閲覧権限チェック（admin権限、全社KPI、部門ID配列包含判定）
 * - 作成・更新・削除時に監査ログを記録
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Service Specification)
 */
import { Injectable } from '@nestjs/common';
import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import type {
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
} from '@epm/contracts/api/kpi-master';
import {
  KpiMasterItemNotFoundError,
  KpiMasterItemTypeImmutableError,
  KpiMasterItemDeleteForbiddenError,
  KpiMasterItemAccessDeniedError,
  KpiMasterItemInvalidReferenceError,
} from '@epm/contracts/shared/errors';

/**
 * User context for permission checks
 */
export interface UserContext {
  userId: string;
  permissions: string[];
  controlDepartmentStableIds: string[];
}

@Injectable()
export class KpiMasterItemService {
  constructor(
    private readonly kpiMasterItemRepository: KpiMasterItemRepository,
    private readonly kpiMasterEventRepository: KpiMasterEventRepository,
  ) {}

  /**
   * KPI項目一覧取得
   *
   * 部門別閲覧権限チェックを適用
   */
  async findAllItems(
    tenantId: string,
    query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>,
    userContext: UserContext,
  ): Promise<KpiMasterItemApiDto[]> {
    const items = await this.kpiMasterItemRepository.findAll(tenantId, query);

    // 部門別閲覧権限フィルタ
    return items.filter((item) =>
      this.checkReadPermission(item, userContext),
    );
  }

  /**
   * KPI項目詳細取得
   *
   * 部門別閲覧権限チェックを適用
   */
  async findItemById(
    tenantId: string,
    id: string,
    userContext: UserContext,
  ): Promise<KpiMasterItemApiDto> {
    const item = await this.kpiMasterItemRepository.findById(tenantId, id);

    if (!item) {
      throw new KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
    }

    // 部門別閲覧権限チェック
    if (!this.checkReadPermission(item, userContext)) {
      throw new KpiMasterItemAccessDeniedError(
        `Access denied to KPI item: ${id}`,
      );
    }

    return item;
  }

  /**
   * KPI項目作成
   *
   * ビジネスルール:
   * - kpi_code 重複チェック（イベント内）
   * - kpi_type 別の参照ID検証（排他制約）
   * - 参照先妥当性検証（Phase 2: kpi_managed=true チェック）
   */
  async createItem(
    tenantId: string,
    userId: string,
    data: Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'> & {
      company_id: string;
    },
  ): Promise<KpiMasterItemApiDto> {
    // kpi_code 重複チェック
    const existingItem = await this.kpiMasterItemRepository.findByKpiCode(
      tenantId,
      data.event_id,
      data.kpi_code,
    );

    if (existingItem) {
      throw new KpiMasterItemInvalidReferenceError(
        `KPI code already exists: ${data.kpi_code}`,
      );
    }

    // kpi_type 別参照ID検証（排他制約）
    this.validateKpiTypeReferences(data);

    // TODO: Phase 2 - 参照先妥当性検証（kpi_managed=true チェック）
    // if (data.kpi_type === 'FINANCIAL' && data.ref_subject_id) {
    //   await this.validateSubjectReference(tenantId, data.ref_subject_id);
    // }
    // if (data.kpi_type === 'METRIC' && data.ref_metric_id) {
    //   await this.validateMetricReference(tenantId, data.ref_metric_id);
    // }

    // KPI項目作成
    const item = await this.kpiMasterItemRepository.create(tenantId, {
      tenant_id: tenantId,
      company_id: data.company_id,
      event_id: data.event_id,
      kpi_code: data.kpi_code,
      kpi_name: data.kpi_name,
      kpi_type: data.kpi_type,
      hierarchy_level: data.hierarchy_level,
      parent_kpi_item_id: data.parent_kpi_item_id,
      ref_subject_id: data.ref_subject_id,
      ref_kpi_definition_id: data.ref_kpi_definition_id,
      ref_metric_id: data.ref_metric_id,
      department_stable_id: data.department_stable_id,
      owner_employee_id: data.owner_employee_id,
      unit: data.unit,
      sort_order: data.sort_order,
      created_by: userId,
    });

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_item.create', { itemId: item.id, userId });

    return item;
  }

  /**
   * KPI項目更新
   *
   * ビジネスルール:
   * - kpi_type・参照先IDは変更不可
   * - 名称・部門・担当者・並び順のみ更新可能
   */
  async updateItem(
    tenantId: string,
    id: string,
    userId: string,
    data: Omit<UpdateKpiMasterItemApiDto, 'updated_by'>,
    userContext: UserContext,
  ): Promise<KpiMasterItemApiDto> {
    // KPI項目存在確認
    const item = await this.kpiMasterItemRepository.findById(tenantId, id);

    if (!item) {
      throw new KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
    }

    // 部門別編集権限チェック
    if (!this.checkWritePermission(item, userContext)) {
      throw new KpiMasterItemAccessDeniedError(
        `Write access denied to KPI item: ${id}`,
      );
    }

    // KPI項目更新
    const updatedItem = await this.kpiMasterItemRepository.update(
      tenantId,
      id,
      {
        kpi_name: data.kpi_name,
        department_stable_id: data.department_stable_id,
        owner_employee_id: data.owner_employee_id,
        unit: data.unit,
        sort_order: data.sort_order,
        updated_by: userId,
      },
    );

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_item.update', { itemId: id, userId });

    return updatedItem;
  }

  /**
   * KPI項目削除（論理削除）
   *
   * ビジネスルール:
   * - CONFIRMED 状態のイベント内では削除禁止
   * - 子KPI項目が存在する場合は削除禁止
   */
  async deleteItem(
    tenantId: string,
    id: string,
    userId: string,
    userContext: UserContext,
  ): Promise<void> {
    // KPI項目存在確認
    const item = await this.kpiMasterItemRepository.findById(tenantId, id);

    if (!item) {
      throw new KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
    }

    // 部門別編集権限チェック
    if (!this.checkWritePermission(item, userContext)) {
      throw new KpiMasterItemAccessDeniedError(
        `Write access denied to KPI item: ${id}`,
      );
    }

    // イベント状態確認
    const event = await this.kpiMasterEventRepository.findById(
      tenantId,
      item.event_id,
    );

    if (event && event.status === 'CONFIRMED') {
      throw new KpiMasterItemDeleteForbiddenError(
        `Cannot delete KPI item in confirmed event: ${id}`,
      );
    }

    // 子KPI項目存在確認
    const hasChildren = await this.kpiMasterItemRepository.hasChildren(
      tenantId,
      id,
    );

    if (hasChildren) {
      throw new KpiMasterItemDeleteForbiddenError(
        `Cannot delete KPI item with children: ${id}`,
      );
    }

    // 論理削除
    await this.kpiMasterItemRepository.delete(tenantId, id);

    // TODO: 監査ログ記録
    // auditLog.record('kpi_master_item.delete', { itemId: id, userId });
  }

  /**
   * kpi_type 別参照ID検証（排他制約）
   */
  private validateKpiTypeReferences(
    data: Pick<
      CreateKpiMasterItemApiDto,
      | 'kpi_type'
      | 'ref_subject_id'
      | 'ref_kpi_definition_id'
      | 'ref_metric_id'
    >,
  ): void {
    const { kpi_type, ref_subject_id, ref_kpi_definition_id, ref_metric_id } =
      data;

    if (kpi_type === 'FINANCIAL') {
      if (!ref_subject_id || ref_kpi_definition_id || ref_metric_id) {
        throw new KpiMasterItemInvalidReferenceError(
          'FINANCIAL type requires ref_subject_id only',
        );
      }
    } else if (kpi_type === 'NON_FINANCIAL') {
      if (!ref_kpi_definition_id || ref_subject_id || ref_metric_id) {
        throw new KpiMasterItemInvalidReferenceError(
          'NON_FINANCIAL type requires ref_kpi_definition_id only',
        );
      }
    } else if (kpi_type === 'METRIC') {
      if (!ref_metric_id || ref_subject_id || ref_kpi_definition_id) {
        throw new KpiMasterItemInvalidReferenceError(
          'METRIC type requires ref_metric_id only',
        );
      }
    }
  }

  /**
   * 部門別閲覧権限チェック
   *
   * Phase 1 ロジック:
   * 1. admin権限チェック（epm.kpi.admin → 全社閲覧可能）
   * 2. 全社KPIチェック（department_stable_id=NULL → 全ユーザー閲覧可能）
   * 3. 部門IDチェック（control_department_stable_ids.includes(department_stable_id)）
   */
  private checkReadPermission(
    item: KpiMasterItemApiDto,
    userContext: UserContext,
  ): boolean {
    // 1. admin権限チェック
    if (userContext.permissions.includes('epm.kpi.admin')) {
      return true;
    }

    // 2. 全社KPIチェック
    if (!item.department_stable_id) {
      return true;
    }

    // 3. 部門IDチェック
    return userContext.controlDepartmentStableIds.includes(
      item.department_stable_id,
    );
  }

  /**
   * 部門別編集権限チェック
   *
   * Phase 1 ロジック:
   * - 閲覧権限 + epm.kpi.write 権限
   */
  private checkWritePermission(
    item: KpiMasterItemApiDto,
    userContext: UserContext,
  ): boolean {
    // 閲覧権限チェック
    if (!this.checkReadPermission(item, userContext)) {
      return false;
    }

    // 編集権限チェック
    return (
      userContext.permissions.includes('epm.kpi.admin') ||
      userContext.permissions.includes('epm.kpi.write')
    );
  }
}
