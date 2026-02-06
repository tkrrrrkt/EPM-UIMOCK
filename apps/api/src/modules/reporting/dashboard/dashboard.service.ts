/**
 * Dashboard Service
 *
 * @module reporting/dashboard
 *
 * Business Rules:
 * - システムテンプレート（owner_type=SYSTEM）は削除不可
 * - 複製時は名前に「（コピー）」を付与し、owner_id を実行者に変更
 * - 作成・更新・削除時に監査ログを記録
 */
import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import {
  ApiDashboardDto,
  ApiDashboardDetailDto,
  ApiCreateDashboardDto,
  ApiUpdateDashboardDto,
} from '@epm/contracts/api/dashboard';
import {
  DashboardNotFoundError,
  DashboardDeleteForbiddenError,
} from '@epm/contracts/shared/errors';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * ダッシュボード一覧取得
   */
  async findAll(tenantId: string): Promise<ApiDashboardDto[]> {
    return this.dashboardRepository.findAll(tenantId);
  }

  /**
   * ダッシュボード詳細取得（ウィジェット含む）
   */
  async findById(tenantId: string, id: string): Promise<ApiDashboardDetailDto> {
    const dashboard = await this.dashboardRepository.findByIdWithWidgets(tenantId, id);

    if (!dashboard) {
      throw new DashboardNotFoundError(`Dashboard not found: ${id}`);
    }

    return dashboard;
  }

  /**
   * ダッシュボード作成
   */
  async create(
    tenantId: string,
    userId: string,
    data: ApiCreateDashboardDto,
  ): Promise<ApiDashboardDetailDto> {
    // テンプレートから作成の場合
    if (data.templateId) {
      const template = await this.dashboardRepository.findTemplateByIdWithWidgets(
        tenantId,
        data.templateId,
      );

      if (!template) {
        throw new DashboardNotFoundError(`Template not found: ${data.templateId}`);
      }

      // テンプレートの設定をコピー
      const createData: ApiCreateDashboardDto = {
        name: data.name || `${template.name}（コピー）`,
        description: data.description ?? template.description ?? undefined,
        globalFilterConfig: data.globalFilterConfig ?? template.globalFilterConfig,
        widgets: template.widgets.map((w) => ({
          widgetType: w.widgetType,
          title: w.title,
          layout: w.layout,
          dataConfig: w.dataConfig,
          filterConfig: w.filterConfig,
          displayConfig: w.displayConfig,
          sortOrder: w.sortOrder,
        })),
      };

      const dashboard = await this.dashboardRepository.create(tenantId, createData, userId);

      // TODO: 監査ログ記録
      // auditLog.record('dashboard.create', { dashboardId: dashboard.id, fromTemplate: data.templateId });

      return dashboard;
    }

    // 新規作成
    const dashboard = await this.dashboardRepository.create(tenantId, data, userId);

    // TODO: 監査ログ記録
    // auditLog.record('dashboard.create', { dashboardId: dashboard.id });

    return dashboard;
  }

  /**
   * ダッシュボード更新
   */
  async update(
    tenantId: string,
    id: string,
    data: ApiUpdateDashboardDto,
    userId: string,
  ): Promise<ApiDashboardDetailDto> {
    const dashboard = await this.dashboardRepository.update(tenantId, id, data, userId);

    if (!dashboard) {
      throw new DashboardNotFoundError(`Dashboard not found: ${id}`);
    }

    // TODO: 監査ログ記録
    // auditLog.record('dashboard.update', { dashboardId: id });

    return dashboard;
  }

  /**
   * ダッシュボード削除（論理削除）
   *
   * ビジネスルール：
   * - システムテンプレート（owner_type=SYSTEM）は削除不可
   */
  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    // 存在確認
    const dashboard = await this.dashboardRepository.findById(tenantId, id);

    if (!dashboard) {
      throw new DashboardNotFoundError(`Dashboard not found: ${id}`);
    }

    // システムテンプレート削除禁止
    if (dashboard.ownerType === 'SYSTEM') {
      throw new DashboardDeleteForbiddenError(
        'System template dashboard cannot be deleted',
      );
    }

    const deleted = await this.dashboardRepository.softDelete(tenantId, id, userId);

    if (!deleted) {
      throw new DashboardNotFoundError(`Dashboard not found: ${id}`);
    }

    // TODO: 監査ログ記録
    // auditLog.record('dashboard.delete', { dashboardId: id });
  }

  /**
   * ダッシュボード複製
   *
   * - 全設定をコピー
   * - 名前に「（コピー）」を付与
   * - owner_id を実行者に変更
   */
  async duplicate(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<ApiDashboardDetailDto> {
    const source = await this.dashboardRepository.findByIdWithWidgets(tenantId, id);

    if (!source) {
      throw new DashboardNotFoundError(`Dashboard not found: ${id}`);
    }

    const createData: ApiCreateDashboardDto = {
      name: `${source.name}（コピー）`,
      description: source.description ?? undefined,
      globalFilterConfig: source.globalFilterConfig,
      widgets: source.widgets.map((w) => ({
        widgetType: w.widgetType,
        title: w.title,
        layout: w.layout,
        dataConfig: w.dataConfig,
        filterConfig: w.filterConfig,
        displayConfig: w.displayConfig,
        sortOrder: w.sortOrder,
      })),
    };

    const dashboard = await this.dashboardRepository.create(tenantId, createData, userId);

    // TODO: 監査ログ記録
    // auditLog.record('dashboard.duplicate', { dashboardId: dashboard.id, sourceId: id });

    return dashboard;
  }

  /**
   * システムテンプレート一覧取得
   */
  async findTemplates(tenantId: string): Promise<ApiDashboardDto[]> {
    return this.dashboardRepository.findTemplates(tenantId);
  }

  /**
   * 科目（財務）選択肢取得
   */
  async getSubjectSelectors(tenantId: string, companyId: string) {
    const subjects = await this.dashboardRepository.getActiveSubjects(tenantId, companyId);
    return { items: subjects };
  }

  /**
   * 指標（メトリクス）選択肢取得
   */
  async getMetricSelectors(tenantId: string, companyId: string) {
    const metrics = await this.dashboardRepository.getActiveMetrics(tenantId, companyId);
    return { items: metrics };
  }
}
