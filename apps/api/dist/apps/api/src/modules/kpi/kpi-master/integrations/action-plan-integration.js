"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateActionPlanKpiReference = validateActionPlanKpiReference;
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
async function validateActionPlanKpiReference(tenantId, subjectId, kpiMasterItemId, kpiMasterItemRepo) {
    if (!subjectId && !kpiMasterItemId) {
        throw new errors_1.ActionPlanInvalidReferenceError('Action Plan must reference either a Subject (subjectId) or a KPI Master Item (kpiMasterItemId)');
    }
    if (subjectId && kpiMasterItemId) {
        throw new errors_1.ActionPlanInvalidReferenceError('Action Plan cannot reference both Subject and KPI Master Item. Use only one.');
    }
    if (kpiMasterItemId) {
        const kpiItem = await kpiMasterItemRepo.findById(tenantId, kpiMasterItemId);
        if (!kpiItem) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI Master Item not found: ${kpiMasterItemId}`);
        }
    }
}
//# sourceMappingURL=action-plan-integration.js.map