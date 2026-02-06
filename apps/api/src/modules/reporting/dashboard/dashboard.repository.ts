/**
 * Dashboard Repository
 *
 * @module reporting/dashboard
 *
 * Repository Requirements:
 * - tenant_id required for all methods (RLS + application level double-guard)
 * - WHERE clause double-guard required
 * - set_config prerequisite (RLS enabled, no bypass)
 * - Logical deletion via deleted_at column
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ApiDashboardDto,
  ApiDashboardDetailDto,
  ApiWidgetDto,
  ApiCreateDashboardDto,
  ApiUpdateDashboardDto,
  GlobalFilterConfig,
  WidgetLayoutConfig,
  WidgetDataConfig,
  WidgetFilterConfig,
  WidgetDisplayConfig,
  WidgetType,
  OwnerType,
} from '@epm/contracts/api/dashboard';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 全ダッシュボード取得（論理削除除外）
   */
  async findAll(tenantId: string): Promise<ApiDashboardDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const dashboards = await this.prisma.dashboards.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null, // 論理削除除外
      },
      orderBy: { sort_order: 'asc' },
    });

    return dashboards.map((d) => this.mapToApiDto(d));
  }

  /**
   * ID でダッシュボード取得（論理削除除外）
   */
  async findById(tenantId: string, id: string): Promise<ApiDashboardDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const dashboard = await this.prisma.dashboards.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        deleted_at: null,
      },
    });

    return dashboard ? this.mapToApiDto(dashboard) : null;
  }

  /**
   * ウィジェット含む詳細取得
   */
  async findByIdWithWidgets(
    tenantId: string,
    id: string,
  ): Promise<ApiDashboardDetailDto | null> {
    await this.prisma.setTenantContext(tenantId);

    const dashboard = await this.prisma.dashboards.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        deleted_at: null,
      },
      include: {
        widgets: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!dashboard) {
      return null;
    }

    return this.mapToDetailDto(dashboard);
  }

  /**
   * ダッシュボード作成（ウィジェット含む）
   */
  async create(
    tenantId: string,
    data: ApiCreateDashboardDto,
    userId?: string,
  ): Promise<ApiDashboardDetailDto> {
    await this.prisma.setTenantContext(tenantId);

    const dashboard = await this.prisma.dashboards.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        description: data.description ?? null,
        owner_type: 'USER', // 新規作成はユーザー所有
        owner_id: userId ?? null,
        global_filter_config: (data.globalFilterConfig ?? {}) as object,
        is_active: true,
        sort_order: 0,
        created_by: userId ?? null,
        updated_by: userId ?? null,
        widgets: data.widgets
          ? {
              create: data.widgets.map((w, index) => ({
                widget_type: w.widgetType,
                title: w.title,
                layout: w.layout as object,
                data_config: w.dataConfig as object,
                filter_config: w.filterConfig as object,
                display_config: w.displayConfig as object,
                sort_order: w.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        widgets: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    return this.mapToDetailDto(dashboard);
  }

  /**
   * ダッシュボード更新（ウィジェット含む、トランザクション）
   */
  async update(
    tenantId: string,
    id: string,
    data: ApiUpdateDashboardDto,
    userId?: string,
  ): Promise<ApiDashboardDetailDto | null> {
    await this.prisma.setTenantContext(tenantId);

    // 存在確認（tenant_id double-guard）
    const existing = await this.prisma.dashboards.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        deleted_at: null,
      },
    });

    if (!existing) {
      return null;
    }

    // トランザクションで更新
    const dashboard = await this.prisma.$transaction(async (tx) => {
      // ダッシュボード本体更新
      await tx.dashboards.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.globalFilterConfig !== undefined && {
            global_filter_config: data.globalFilterConfig as object,
          }),
          updated_by: userId ?? null,
        },
      });

      // ウィジェット更新（指定された場合は全削除→再作成）
      if (data.widgets !== undefined) {
        // 既存ウィジェット削除
        await tx.dashboard_widgets.deleteMany({
          where: { dashboard_id: id },
        });

        // 新規ウィジェット作成
        if (data.widgets.length > 0) {
          await tx.dashboard_widgets.createMany({
            data: data.widgets.map((w, index) => ({
              dashboard_id: id,
              widget_type: w.widgetType,
              title: w.title,
              layout: w.layout as object,
              data_config: w.dataConfig as object,
              filter_config: w.filterConfig as object,
              display_config: w.displayConfig as object,
              sort_order: w.sortOrder ?? index,
            })),
          });
        }
      }

      // 更新後のダッシュボード取得
      return tx.dashboards.findFirst({
        where: { id },
        include: {
          widgets: {
            orderBy: { sort_order: 'asc' },
          },
        },
      });
    });

    return dashboard ? this.mapToDetailDto(dashboard) : null;
  }

  /**
   * 論理削除
   */
  async softDelete(
    tenantId: string,
    id: string,
    deletedBy: string,
  ): Promise<boolean> {
    await this.prisma.setTenantContext(tenantId);

    const existing = await this.prisma.dashboards.findFirst({
      where: {
        tenant_id: tenantId,
        id,
        deleted_at: null,
      },
    });

    if (!existing) {
      return false;
    }

    await this.prisma.dashboards.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
    });

    return true;
  }

  /**
   * システムテンプレート一覧取得
   */
  async findTemplates(tenantId: string): Promise<ApiDashboardDto[]> {
    await this.prisma.setTenantContext(tenantId);

    const templates = await this.prisma.dashboards.findMany({
      where: {
        tenant_id: tenantId,
        owner_type: 'SYSTEM',
        deleted_at: null,
      },
      orderBy: { sort_order: 'asc' },
    });

    return templates.map((t) => this.mapToApiDto(t));
  }

  /**
   * テンプレートから複製（詳細含む）
   */
  async findTemplateByIdWithWidgets(
    tenantId: string,
    templateId: string,
  ): Promise<ApiDashboardDetailDto | null> {
    return this.findByIdWithWidgets(tenantId, templateId);
  }

  // =========================================================================
  // Private Mapping Methods
  // =========================================================================

  private mapToApiDto(dashboard: any): ApiDashboardDto {
    return {
      id: dashboard.id,
      tenantId: dashboard.tenant_id,
      name: dashboard.name,
      description: dashboard.description ?? null,
      ownerType: dashboard.owner_type as OwnerType,
      ownerId: dashboard.owner_id ?? null,
      globalFilterConfig: (dashboard.global_filter_config as GlobalFilterConfig) ?? {},
      isActive: dashboard.is_active,
      sortOrder: dashboard.sort_order,
      createdAt: dashboard.created_at.toISOString(),
      updatedAt: dashboard.updated_at.toISOString(),
      createdBy: dashboard.created_by ?? null,
      updatedBy: dashboard.updated_by ?? null,
      deletedAt: dashboard.deleted_at?.toISOString() ?? null,
      deletedBy: dashboard.deleted_by ?? null,
    };
  }

  private mapToDetailDto(dashboard: any): ApiDashboardDetailDto {
    return {
      ...this.mapToApiDto(dashboard),
      widgets: (dashboard.widgets ?? []).map((w: any) => this.mapToWidgetDto(w)),
    };
  }

  private mapToWidgetDto(widget: any): ApiWidgetDto {
    return {
      id: widget.id,
      dashboardId: widget.dashboard_id,
      widgetType: widget.widget_type as WidgetType,
      title: widget.title,
      layout: widget.layout as WidgetLayoutConfig,
      dataConfig: widget.data_config as WidgetDataConfig,
      filterConfig: widget.filter_config as WidgetFilterConfig,
      displayConfig: widget.display_config as WidgetDisplayConfig,
      sortOrder: widget.sort_order,
      createdAt: widget.created_at.toISOString(),
      updatedAt: widget.updated_at.toISOString(),
    };
  }

  /**
   * 科目（財務）選択肢取得
   * テナントでフィルター、有効な科目のみ
   */
  async getActiveSubjects(tenantId: string, companyId: string) {
    await this.prisma.setTenantContext(tenantId);

    const subjects = await this.prisma.subjects.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
      select: {
        id: true,
        subject_code: true,
        subject_name: true,
      },
      orderBy: {
        subject_code: 'asc',
      },
    });

    return subjects.map((s: any) => ({
      stableId: s.id,
      subjectCode: s.subject_code,
      subjectName: s.subject_name,
      parentStableId: null,
      level: 1,
    }));
  }

  /**
   * 指標（メトリクス）選択肢取得
   * テナントでフィルター、有効な指標のみ
   */
  async getActiveMetrics(tenantId: string, companyId: string) {
    await this.prisma.setTenantContext(tenantId);

    const metrics = await this.prisma.metrics.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
      select: {
        id: true,
        metric_code: true,
        metric_name: true,
      },
      orderBy: {
        metric_code: 'asc',
      },
    });

    return metrics.map((m: any) => ({
      id: m.id,
      metricCode: m.metric_code,
      metricName: m.metric_name,
      metricType: 'KPI_METRIC' as const,
      unit: null,
    }));
  }
}
