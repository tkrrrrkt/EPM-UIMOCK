import { KpiMasterEventDto, KpiMasterItemDto, KpiMasterItemDetailDto, PeriodFactDto } from '@epm-sdd/contracts/bff/kpi-master';
import { KpiMasterEventApiDto, KpiMasterItemApiDto, KpiFactAmountApiDto, KpiTargetValueApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare const KpiMasterMapper: {
    toKpiMasterEventDto(apiDto: KpiMasterEventApiDto): KpiMasterEventDto;
    toKpiMasterItemDto(apiDto: KpiMasterItemApiDto): KpiMasterItemDto;
    toKpiMasterItemDetailDto(apiDto: KpiMasterItemApiDto, factAmounts: KpiFactAmountApiDto[], targetValues: KpiTargetValueApiDto[], actionPlans: any[]): KpiMasterItemDetailDto;
    assemblePeriodFacts(kpiType: string, factAmounts: KpiFactAmountApiDto[], targetValues: KpiTargetValueApiDto[]): Record<string, PeriodFactDto>;
    calculateAchievementRate(actualValue: number | undefined, targetValue: number | undefined): number | undefined;
};
