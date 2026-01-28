import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';
export interface CreateReportPageDto {
    layoutId: string;
    pageCode: string;
    pageName: string;
    pageType: ReportPageType;
    expandDimensionId?: string;
}
