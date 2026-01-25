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
import { KpiMasterEventService } from './services/kpi-master-event.service';
import { KpiMasterItemService } from './services/kpi-master-item.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { KpiFactAmountService } from './services/kpi-fact-amount.service';
import { KpiTargetValueService } from './services/kpi-target-value.service';
import {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
} from '@epm-sdd/contracts/api/kpi-master';

/**
 * KpiMasterController
 *
 * Purpose:
 * - Expose KPI Management Master REST API
 * - Extract tenant_id/user_id from headers (x-tenant-id, x-user-id)
 * - Delegate business logic to domain services
 *
 * Authentication / Tenant Context:
 * - tenant_id/user_id resolved from HTTP headers
 * - All requests require x-tenant-id header
 * - User ID extracted for audit trail
 */
@Controller('kpi-master')
export class KpiMasterController {
  constructor(
    private readonly eventService: KpiMasterEventService,
    private readonly itemService: KpiMasterItemService,
    private readonly definitionService: KpiDefinitionService,
    private readonly factAmountService: KpiFactAmountService,
    private readonly targetValueService: KpiTargetValueService,
  ) {}

  // ==================== KPI Master Events ====================

  /**
   * GET /kpi-master/events
   * List KPI management events with filters/pagination
   */
  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetKpiMasterEventsApiQueryDto,
  ): Promise<{ data: KpiMasterEventApiDto[]; total: number }> {
    return this.eventService.findAll(tenantId, query);
  }

  /**
   * GET /kpi-master/events/:id
   * Get KPI management event by ID
   */
  @Get('events/:id')
  async getEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventApiDto> {
    return this.eventService.findById(tenantId, id);
  }

  /**
   * POST /kpi-master/events
   * Create new KPI management event
   */
  @Post('events')
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterEventApiDto,
  ): Promise<KpiMasterEventApiDto> {
    return this.eventService.create(tenantId, data, userId);
  }

  /**
   * PUT /kpi-master/events/:id
   * Update KPI management event
   */
  @Put('events/:id')
  async updateEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateKpiMasterEventApiDto>,
  ): Promise<KpiMasterEventApiDto> {
    return this.eventService.update(tenantId, id, data, userId);
  }

  /**
   * POST /kpi-master/events/:id/confirm
   * Confirm KPI management event (DRAFT → CONFIRMED)
   */
  @Post('events/:id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventApiDto> {
    return this.eventService.confirm(tenantId, id, userId);
  }

  // ==================== KPI Master Items ====================

  /**
   * GET /kpi-master/items
   * List KPI items with filters/pagination
   */
  @Get('items')
  async getItems(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetKpiMasterItemsApiQueryDto,
  ): Promise<{ data: KpiMasterItemApiDto[]; total: number }> {
    // TODO: Extract user permissions from headers or JWT for access control
    return this.itemService.findAll(tenantId, query);
  }

  /**
   * GET /kpi-master/items/:id
   * Get KPI item by ID
   */
  @Get('items/:id')
  async getItem(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterItemApiDto> {
    // TODO: Extract user permissions from headers or JWT for access control
    return this.itemService.findById(tenantId, id);
  }

  /**
   * GET /kpi-master/events/:eventId/items
   * Get all KPI items for an event
   */
  @Get('events/:eventId/items')
  async getItemsByEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('eventId') eventId: string,
  ): Promise<KpiMasterItemApiDto[]> {
    return this.itemService.findByEventId(tenantId, eventId);
  }

  /**
   * POST /kpi-master/items
   * Create new KPI item
   */
  @Post('items')
  async createItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto> {
    return this.itemService.create(tenantId, data, userId);
  }

  /**
   * PUT /kpi-master/items/:id
   * Update KPI item
   */
  @Put('items/:id')
  async updateItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiMasterItemApiDto,
  ): Promise<KpiMasterItemApiDto> {
    return this.itemService.update(tenantId, id, data, userId);
  }

  /**
   * DELETE /kpi-master/items/:id
   * Delete KPI item (logical delete)
   */
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.itemService.delete(tenantId, id, userId);
  }

  // ==================== KPI Definitions ====================

  /**
   * GET /kpi-master/definitions
   * List KPI definitions with filters/pagination
   */
  @Get('definitions')
  async getDefinitions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('companyId') companyId?: string,
    @Query('keyword') keyword?: string,
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '50',
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: KpiDefinitionApiDto[]; total: number }> {
    return this.definitionService.findAll(tenantId, {
      companyId,
      keyword,
      offset: parseInt(offset, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
    });
  }

  /**
   * POST /kpi-master/definitions
   * Create new KPI definition
   */
  @Post('definitions')
  async createDefinition(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiDefinitionApiDto,
  ): Promise<KpiDefinitionApiDto> {
    return this.definitionService.create(tenantId, data, userId);
  }

  // ==================== KPI Fact Amounts ====================

  /**
   * GET /kpi-master/definitions/:definitionId/events/:eventId/fact-amounts
   * Get fact amounts for a KPI definition and event
   */
  @Get('definitions/:definitionId/events/:eventId/fact-amounts')
  async getFactAmounts(
    @Headers('x-tenant-id') tenantId: string,
    @Param('definitionId') definitionId: string,
    @Param('eventId') eventId: string,
  ): Promise<KpiFactAmountApiDto[]> {
    return this.factAmountService.findByItemId(tenantId, definitionId, eventId);
  }

  /**
   * POST /kpi-master/fact-amounts
   * Create new fact amount
   */
  @Post('fact-amounts')
  async createFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiFactAmountApiDto,
  ): Promise<KpiFactAmountApiDto> {
    return this.factAmountService.create(tenantId, data, userId);
  }

  /**
   * PUT /kpi-master/fact-amounts/:id
   * Update fact amount
   */
  @Put('fact-amounts/:id')
  async updateFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateKpiFactAmountApiDto>,
  ): Promise<KpiFactAmountApiDto> {
    return this.factAmountService.update(tenantId, id, data, userId);
  }

  // ==================== KPI Target Values ====================

  /**
   * GET /kpi-master/items/:itemId/target-values
   * Get target values for a KPI item
   */
  @Get('items/:itemId/target-values')
  async getTargetValues(
    @Headers('x-tenant-id') tenantId: string,
    @Param('itemId') itemId: string,
  ): Promise<KpiTargetValueApiDto[]> {
    return this.targetValueService.findByItemId(tenantId, itemId);
  }

  /**
   * POST /kpi-master/target-values
   * Create new target value
   */
  @Post('target-values')
  async createTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    return this.targetValueService.create(tenantId, data, userId);
  }

  /**
   * PUT /kpi-master/target-values/:id
   * Update target value
   */
  @Put('target-values/:id')
  async updateTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Partial<CreateKpiTargetValueApiDto>,
  ): Promise<KpiTargetValueApiDto> {
    return this.targetValueService.update(tenantId, id, data, userId);
  }
}
