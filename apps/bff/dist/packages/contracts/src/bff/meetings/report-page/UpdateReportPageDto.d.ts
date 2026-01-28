import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';
export interface UpdateReportPageDto {
    pageCode?: string;
    pageName?: string;
    pageType?: ReportPageType;
    expandDimensionId?: string | null;
    isActive?: boolean;
}
