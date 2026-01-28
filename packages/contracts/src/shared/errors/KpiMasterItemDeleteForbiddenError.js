"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterItemDeleteForbiddenError = void 0;
class KpiMasterItemDeleteForbiddenError extends Error {
    constructor(message = 'Cannot delete KPI master item in CONFIRMED event') {
        super(message);
        this.name = 'KpiMasterItemDeleteForbiddenError';
    }
}
exports.KpiMasterItemDeleteForbiddenError = KpiMasterItemDeleteForbiddenError;
//# sourceMappingURL=KpiMasterItemDeleteForbiddenError.js.map