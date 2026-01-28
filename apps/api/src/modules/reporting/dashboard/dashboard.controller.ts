/**
 * Dashboard API Controller
 *
 * @module reporting/dashboard
 *
 * Domain API Endpoints:
 * - GET    /api/reporting/dashboards          - ダッシュボード一覧
 * - GET    /api/reporting/dashboards/:id      - ダッシュボード詳細
 * - POST   /api/reporting/dashboards          - ダッシュボード作成
 * - PUT    /api/reporting/dashboards/:id      - ダッシュボード更新
 * - DELETE /api/reporting/dashboards/:id      - ダッシュボード削除
 * - POST   /api/reporting/dashboards/:id/duplicate   - ダッシュボード複製
 * - POST   /api/reporting/dashboards/:id/widgets/:widgetId/data - ウィジェットデータ
 * - GET    /api/reporting/dashboards/templates - テンプレート一覧
 * - GET    /api/reporting/dashboards/selectors - 選択肢取得
 * - GET    /api/reporting/dashboards/selectors/kpi-definitions - KPI定義選択肢
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { WidgetDataService } from './widget-data.service';
import {
  ApiDashboardDto,
  ApiDashboardDetailDto,
  ApiCreateDashboardDto,
  ApiUpdateDashboardDto,
  ApiWidgetDataRequestDto,
  ApiWidgetDataResponseDto,
  ApiDashboardSelectorsResponseDto,
  ApiKpiDefinitionOptionListDto,
} from '@epm/contracts/api/dashboard';
import {
  DashboardNotFoundError,
  DashboardDeleteForbiddenError,
} from '@epm/contracts/shared/errors';

@Controller('reporting/dashboards')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly widgetDataService: WidgetDataService,
  ) {}

  /**
   * GET /api/reporting/dashboards
   * ダッシュボード一覧取得
   */
  @Get()
  async getDashboards(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<ApiDashboardDto[]> {
    this.validateTenantId(tenantId);
    return this.dashboardService.findAll(tenantId);
  }

  /**
   * GET /api/reporting/dashboards/templates
   * テンプレート一覧取得
   */
  @Get('templates')
  async getTemplates(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<ApiDashboardDto[]> {
    this.validateTenantId(tenantId);
    return this.dashboardService.findTemplates(tenantId);
  }

  /**
   * GET /api/reporting/dashboards/selectors
   * 選択肢取得（年度、部門等）
   */
  @Get('selectors')
  async getSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<ApiDashboardSelectorsResponseDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    // TODO: 実際の選択肢データを取得（現在はモック）
    return {
      fiscalYears: [2024, 2025, 2026],
      planEvents: [],
      planVersions: [],
      departments: [],
    };
  }

  /**
   * GET /api/reporting/dashboards/selectors/kpi-definitions
   * 非財務KPI定義の選択肢取得
   */
  @Get('selectors/kpi-definitions')
  async getKpiDefinitionSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<ApiKpiDefinitionOptionListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.widgetDataService.getKpiDefinitionOptions(tenantId, companyId);
  }

  /**
   * GET /api/reporting/dashboards/:id
   * ダッシュボード詳細取得
   */
  @Get(':id')
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<ApiDashboardDetailDto> {
    this.validateTenantId(tenantId);
    try {
      return await this.dashboardService.findById(tenantId, id);
    } catch (error) {
      if (error instanceof DashboardNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/reporting/dashboards
   * ダッシュボード作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: ApiCreateDashboardDto,
  ): Promise<ApiDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    try {
      return await this.dashboardService.create(tenantId, userId, data);
    } catch (error) {
      if (error instanceof DashboardNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * PUT /api/reporting/dashboards/:id
   * ダッシュボード更新
   */
  @Put(':id')
  async updateDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: ApiUpdateDashboardDto,
  ): Promise<ApiDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    try {
      return await this.dashboardService.update(tenantId, id, data, userId);
    } catch (error) {
      if (error instanceof DashboardNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * DELETE /api/reporting/dashboards/:id
   * ダッシュボード削除
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    try {
      await this.dashboardService.delete(tenantId, id, userId);
    } catch (error) {
      if (error instanceof DashboardNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DashboardDeleteForbiddenError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/reporting/dashboards/:id/duplicate
   * ダッシュボード複製
   */
  @Post(':id/duplicate')
  async duplicateDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<ApiDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    try {
      return await this.dashboardService.duplicate(tenantId, userId, id);
    } catch (error) {
      if (error instanceof DashboardNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/reporting/dashboards/:id/widgets/:widgetId/data
   * ウィジェットデータ取得
   */
  @Post(':id/widgets/:widgetId/data')
  async getWidgetData(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() request: ApiWidgetDataRequestDto,
  ): Promise<ApiWidgetDataResponseDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);

    // ダッシュボード取得
    const dashboard = await this.dashboardService.findById(tenantId, dashboardId);

    // ウィジェット検索
    const widget = dashboard.widgets.find((w) => w.id === widgetId);
    if (!widget) {
      throw new NotFoundException(`Widget not found: ${widgetId}`);
    }

    // ウィジェットデータ取得
    return this.widgetDataService.getData(tenantId, companyId, widget, request.filter);
  }

  // =========================================================================
  // Private Validation Methods
  // =========================================================================

  private validateTenantId(tenantId: string): void {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
  }

  private validateCompanyId(companyId: string): void {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
  }
}
