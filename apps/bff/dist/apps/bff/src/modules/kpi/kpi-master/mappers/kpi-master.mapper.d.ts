import type { KpiMasterEventListDto, KpiMasterEventDto, KpiMasterEventDetailDto, CreateKpiMasterEventDto, KpiMasterItemDto, KpiMasterItemDetailDto, CreateKpiMasterItemDto, UpdateKpiMasterItemDto, SelectableSubjectListDto, SelectableMetricListDto, KpiDefinitionListDto, KpiDefinitionDto, CreateKpiDefinitionDto, CreateKpiFactAmountDto, UpdateKpiFactAmountDto, KpiFactAmountDto, CreateKpiTargetValueDto, UpdateKpiTargetValueDto, KpiTargetValueDto } from '@epm/contracts/bff/kpi-master';
import type { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, KpiDefinitionApiDto, CreateKpiDefinitionApiDto, CreateKpiFactAmountApiDto, UpdateKpiFactAmountApiDto, KpiFactAmountApiDto, CreateKpiTargetValueApiDto, UpdateKpiTargetValueApiDto, KpiTargetValueApiDto, SelectableSubjectApiDto, SelectableMetricApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiMasterMapper {
    static toEventList(items: KpiMasterEventApiDto[], total: number, page: number, pageSize: number): KpiMasterEventListDto;
    static toEventDto(event: KpiMasterEventApiDto): KpiMasterEventDto;
    static toEventDetail(event: KpiMasterEventApiDto): KpiMasterEventDetailDto;
    static toCreateEventApiDto(data: CreateKpiMasterEventDto, companyId: string): Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'>;
    static toItemList(items: KpiMasterItemApiDto[]): KpiMasterItemDto[];
    static toItemDto(item: KpiMasterItemApiDto): KpiMasterItemDto;
    static toItemDetail(item: KpiMasterItemApiDto): KpiMasterItemDetailDto;
    static toCreateItemApiDto(data: CreateKpiMasterItemDto, companyId: string): Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'>;
    static toUpdateItemApiDto(data: UpdateKpiMasterItemDto): Omit<UpdateKpiMasterItemApiDto, 'updated_by'>;
    static toSelectableSubjectList(subjects: SelectableSubjectApiDto[]): SelectableSubjectListDto;
    static toSelectableMetricList(metrics: SelectableMetricApiDto[]): SelectableMetricListDto;
    static toDefinitionList(items: KpiDefinitionApiDto[], total: number, page: number, pageSize: number): KpiDefinitionListDto;
    static toDefinitionDto(definition: KpiDefinitionApiDto): KpiDefinitionDto;
    static toCreateDefinitionApiDto(data: CreateKpiDefinitionDto, companyId: string): Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'>;
    static toFactAmountDto(factAmount: KpiFactAmountApiDto, kpiMasterItemIdOverride?: string): KpiFactAmountDto;
    static toCreateFactAmountApiDto(data: CreateKpiFactAmountDto, context: {
        eventId: string;
        kpiDefinitionId: string;
    }): Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'>;
    static toUpdateFactAmountApiDto(data: UpdateKpiFactAmountDto): Omit<UpdateKpiFactAmountApiDto, 'updated_by'>;
    static toTargetValueDto(targetValue: KpiTargetValueApiDto): KpiTargetValueDto;
    static toCreateTargetValueApiDto(data: CreateKpiTargetValueDto): Omit<CreateKpiTargetValueApiDto, 'tenant_id'>;
    static toUpdateTargetValueApiDto(data: UpdateKpiTargetValueDto): UpdateKpiTargetValueApiDto;
    private static calculateAchievementRate;
}
