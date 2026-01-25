import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
export declare function validateActionPlanKpiReference(tenantId: string, subjectId: string | undefined, kpiMasterItemId: string | undefined, kpiMasterItemRepo: KpiMasterItemRepository): Promise<void>;
