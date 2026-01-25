import { AggregationMethod, Direction } from '../../shared/enums/kpi';
export interface KpiDefinitionApiDto {
    id: string;
    companyId: string;
    kpiCode: string;
    kpiName: string;
    description?: string;
    unit?: string;
    aggregationMethod: AggregationMethod;
    direction?: Direction;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}
