import { KpiMasterEventStatus } from '../../shared/enums/kpi';
export interface KpiMasterEventApiDto {
    id: string;
    companyId: string;
    eventCode: string;
    eventName: string;
    fiscalYear: number;
    status: KpiMasterEventStatus;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}
