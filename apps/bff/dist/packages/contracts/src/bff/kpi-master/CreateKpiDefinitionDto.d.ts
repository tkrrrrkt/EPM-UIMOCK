import { AggregationMethod, Direction } from '../../shared/enums/kpi';
export interface CreateKpiDefinitionDto {
    companyId: string;
    kpiCode: string;
    kpiName: string;
    description?: string;
    unit?: string;
    aggregationMethod: AggregationMethod;
    direction?: Direction;
}
