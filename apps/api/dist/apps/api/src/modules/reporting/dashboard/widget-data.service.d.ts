import { PrismaService } from '../../../prisma/prisma.service';
import { ApiWidgetDto, ApiWidgetDataResponseDto, ResolvedFilterConfig, ApiKpiDefinitionOptionListDto } from '@epm/contracts/api/dashboard';
export declare class WidgetDataService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getData(tenantId: string, companyId: string, widget: ApiWidgetDto, filter: ResolvedFilterConfig): Promise<ApiWidgetDataResponseDto>;
    getKpiDefinitionOptions(tenantId: string, companyId: string): Promise<ApiKpiDefinitionOptionListDto>;
    private fetchDataBySourceType;
    private fetchFactData;
    private fetchKpiData;
    private resolveLatestConfirmedKpiEventId;
    private fetchMetricData;
    private calculateDifference;
    private generatePeriodLabels;
    private formatPeriodCode;
    private getUnitForSource;
}
