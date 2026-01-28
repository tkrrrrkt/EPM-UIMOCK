import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';
export interface ReportPageDto {
    id: string;
    layoutId: string;
    pageCode: string;
    pageName: string;
    pageType: ReportPageType;
    expandDimensionId?: string;
    sortOrder: number;
    isActive: boolean;
    componentCount: number;
}
