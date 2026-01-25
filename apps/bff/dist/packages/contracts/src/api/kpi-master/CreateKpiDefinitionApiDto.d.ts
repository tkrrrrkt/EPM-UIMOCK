import { AggregationMethod, Direction } from '../../shared/enums/kpi';
export interface CreateKpiDefinitionApiDto {
    companyId: string;
    kpiCode: string;
    kpiName: string;
    description?: string;
    unit?: string;
    aggregationMethod: AggregationMethod;
    direction?: Direction;
}
