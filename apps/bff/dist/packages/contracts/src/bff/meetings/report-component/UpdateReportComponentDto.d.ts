import type { ReportComponentType, ReportDataSource, ComponentWidth, ComponentHeight } from '@epm/contracts/shared/enums/meetings';
import type { ComponentConfig } from './ComponentConfig';
export interface UpdateReportComponentDto {
    componentCode?: string;
    componentName?: string;
    componentType?: ReportComponentType;
    dataSource?: ReportDataSource;
    width?: ComponentWidth;
    height?: ComponentHeight;
    configJson?: Partial<ComponentConfig>;
    isActive?: boolean;
}
