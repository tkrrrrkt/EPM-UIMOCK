"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterItemNotFoundError = void 0;
class KpiMasterItemNotFoundError extends Error {
    constructor(message = 'KPI master item not found') {
        super(message);
        this.name = 'KpiMasterItemNotFoundError';
    }
}
exports.KpiMasterItemNotFoundError = KpiMasterItemNotFoundError;
//# sourceMappingURL=KpiMasterItemNotFoundError.js.map