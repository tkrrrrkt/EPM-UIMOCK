"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterItemAccessDeniedError = void 0;
class KpiMasterItemAccessDeniedError extends Error {
    constructor(message = 'Access denied to KPI master item due to department permission') {
        super(message);
        this.name = 'KpiMasterItemAccessDeniedError';
    }
}
exports.KpiMasterItemAccessDeniedError = KpiMasterItemAccessDeniedError;
//# sourceMappingURL=KpiMasterItemAccessDeniedError.js.map