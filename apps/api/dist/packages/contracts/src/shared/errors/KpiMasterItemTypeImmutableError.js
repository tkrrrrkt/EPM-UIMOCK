"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterItemTypeImmutableError = void 0;
class KpiMasterItemTypeImmutableError extends Error {
    constructor(message = 'KPI master item type and reference ID cannot be changed') {
        super(message);
        this.name = 'KpiMasterItemTypeImmutableError';
    }
}
exports.KpiMasterItemTypeImmutableError = KpiMasterItemTypeImmutableError;
//# sourceMappingURL=KpiMasterItemTypeImmutableError.js.map