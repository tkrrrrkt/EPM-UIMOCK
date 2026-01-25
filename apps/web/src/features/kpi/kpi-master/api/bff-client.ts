import type {
  // Events
  KpiMasterEventListDto,
  KpiMasterEventDetailDto,
  CreateKpiMasterEventDto,
  GetKpiMasterEventsQueryDto,
  KpiMasterEventDto,
  // Items
  KpiMasterItemListDto,
  KpiMasterItemDetailDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  GetKpiMasterItemsQueryDto,
  // Selectable
  SelectableSubjectListDto,
  SelectableMetricListDto,
  // Definitions
  KpiDefinitionListDto,
  CreateKpiDefinitionDto,
  GetKpiDefinitionsQueryDto,
  KpiDefinitionDto,
  // Fact Amounts
  CreateKpiFactAmountDto,
  UpdateKpiFactAmountDto,
  KpiFactAmountDto,
  // Target Values
  CreateKpiTargetValueDto,
  UpdateKpiTargetValueDto,
  KpiTargetValueDto,
} from '@epm-sdd/contracts/bff/kpi-master';

/**
 * BffClient Interface for KPI Master
 *
 * Purpose:
 * - Define all BFF API methods for KPI Master feature
 * - Enable MockBffClient and HttpBffClient implementations
 * - Ensure type safety across UI layer
 */
export interface BffClient {
  // ========== KPI Management Events ==========

  /**
   * Get KPI management events list with paging/filtering
   */
  getEvents(query: GetKpiMasterEventsQueryDto): Promise<KpiMasterEventListDto>;

  /**
   * Get KPI management event detail by ID
   */
  getEventById(id: string): Promise<KpiMasterEventDetailDto>;

  /**
   * Create new KPI management event
   */
  createEvent(data: CreateKpiMasterEventDto): Promise<KpiMasterEventDto>;

  /**
   * Confirm KPI management event (DRAFT → CONFIRMED)
   */
  confirmEvent(id: string): Promise<KpiMasterEventDto>;

  // ========== KPI Items ==========

  /**
   * Get KPI items list with paging/filtering
   */
  getItems(query: GetKpiMasterItemsQueryDto): Promise<KpiMasterItemListDto>;

  /**
   * Get KPI item detail by ID (with period facts and action plans)
   */
  getItemById(id: string): Promise<KpiMasterItemDetailDto>;

  /**
   * Create new KPI item
   */
  createItem(data: CreateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;

  /**
   * Update KPI item
   */
  updateItem(id: string, data: UpdateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;

  /**
   * Delete KPI item (logical delete)
   */
  deleteItem(id: string): Promise<void>;

  // ========== Selectable Options ==========

  /**
   * Get selectable subjects (kpi_managed=true)
   */
  getSelectableSubjects(companyId: string): Promise<SelectableSubjectListDto>;

  /**
   * Get selectable metrics (kpi_managed=true)
   */
  getSelectableMetrics(companyId: string): Promise<SelectableMetricListDto>;

  // ========== Non-Financial KPI Definitions ==========

  /**
   * Get KPI definitions list
   */
  getKpiDefinitions(query: GetKpiDefinitionsQueryDto): Promise<KpiDefinitionListDto>;

  /**
   * Create new KPI definition
   */
  createKpiDefinition(data: CreateKpiDefinitionDto): Promise<KpiDefinitionDto>;

  // ========== Fact Amounts (Non-Financial KPI) ==========

  /**
   * Create fact amount (plan vs actual)
   */
  createFactAmount(data: CreateKpiFactAmountDto): Promise<KpiFactAmountDto>;

  /**
   * Update fact amount
   */
  updateFactAmount(id: string, data: UpdateKpiFactAmountDto): Promise<KpiFactAmountDto>;

  // ========== Target Values (Metric KPI) ==========

  /**
   * Create target value
   */
  createTargetValue(data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto>;

  /**
   * Update target value
   */
  updateTargetValue(id: string, data: UpdateKpiTargetValueDto): Promise<KpiTargetValueDto>;
}
