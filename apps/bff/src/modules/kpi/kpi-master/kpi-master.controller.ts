import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KpiMasterBffService } from './kpi-master.service';
import {
  GetKpiMasterEventsQueryDto,
  KpiMasterEventDto,
  KpiMasterEventListDto,
  CreateKpiMasterEventDto,
  GetKpiMasterItemsQueryDto,
  KpiMasterItemDto,
  KpiMasterItemDetailDto,
  KpiMasterItemListDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
} from '@epm-sdd/contracts/bff/kpi-master';

/**
 * KpiMasterBffController
 *
 * Purpose:
 * - Expose BFF REST API for UI
 * - Extract tenant_id/user_id from auth headers (Clerk)
 * - Delegate to BFF service for normalization and Domain API calls
 * - Return UI-optimized DTOs with page/pageSize/totalCount
 *
 * Authentication / Tenant Context:
 * - tenant_id/user_id resolved from Clerk auth middleware
 * - All requests require authentication
 * - BFF controller passes tenant_id/user_id to service
 *
 * Error Policy:
 * - Pass-through: Domain API errors are passed to UI as-is
 * - UI handles error display based on error codes
 */
@Controller('bff/kpi-master')
export class KpiMasterBffController {
  constructor(private readonly bffService: KpiMasterBffService) {}

  // ==================== KPI Management Events ====================

  /**
   * GET /api/bff/kpi-master/events
   * List KPI management events with paging/sorting/filtering
   *
   * BFF Normalization (handled by service):
   * - page/pageSize → offset/limit
   * - sortBy whitelist validation
   * - keyword trim, empty → undefined
   */
  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetKpiMasterEventsQueryDto,
  ): Promise<KpiMasterEventListDto> {
    return this.bffService.getEvents(tenantId, query);
  }

  /**
   * GET /api/bff/kpi-master/events/:id
   * Get KPI management event by ID
   */
  @Get('events/:id')
  async getEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventDto> {
    return this.bffService.getEventById(tenantId, id);
  }

  /**
   * POST /api/bff/kpi-master/events
   * Create new KPI management event
   */
  @Post('events')
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterEventDto,
  ): Promise<KpiMasterEventDto> {
    return this.bffService.createEvent(tenantId, userId, data);
  }

  /**
   * PUT /api/bff/kpi-master/events/:id
   * Update KPI management event
   */
  @Put('events/:id')
  async updateEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateKpiMasterEventDto>,
  ): Promise<KpiMasterEventDto> {
    return this.bffService.updateEvent(tenantId, userId, id, data);
  }

  /**
   * POST /api/bff/kpi-master/events/:id/confirm
   * Confirm KPI management event (DRAFT → CONFIRMED)
   */
  @Post('events/:id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventDto> {
    return this.bffService.confirmEvent(tenantId, userId, id);
  }

  // ==================== KPI Master Items ====================

  /**
   * GET /api/bff/kpi-master/items
   * List KPI items with paging/sorting/filtering
   *
   * BFF Normalization (handled by service):
   * - page/pageSize → offset/limit
   * - sortBy whitelist validation
   * - keyword trim, empty → undefined
   * - Returns: { items, page, pageSize, totalCount }
   */
  @Get('items')
  async getItems(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetKpiMasterItemsQueryDto,
  ): Promise<KpiMasterItemListDto> {
    return this.bffService.getItems(tenantId, query);
  }

  /**
   * GET /api/bff/kpi-master/items/:id
   * Get KPI item detail by ID
   *
   * BFF Transformation (handled by service/mapper):
   * - Assembles periodFacts from fact amounts/target values
   * - Calculates achievement rates (actual/target × 100)
   * - Includes action plans summary
   */
  @Get('items/:id')
  async getItem(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterItemDetailDto> {
    return this.bffService.getItemById(tenantId, id);
  }

  /**
   * POST /api/bff/kpi-master/items
   * Create new KPI item
   */
  @Post('items')
  async createItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterItemDto,
  ): Promise<KpiMasterItemDto> {
    return this.bffService.createItem(tenantId, userId, data);
  }

  /**
   * PUT /api/bff/kpi-master/items/:id
   * Update KPI item
   */
  @Put('items/:id')
  async updateItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDto> {
    return this.bffService.updateItem(tenantId, userId, id, data);
  }

  /**
   * DELETE /api/bff/kpi-master/items/:id
   * Delete KPI item (logical delete)
   */
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.bffService.deleteItem(tenantId, userId, id);
  }
}
