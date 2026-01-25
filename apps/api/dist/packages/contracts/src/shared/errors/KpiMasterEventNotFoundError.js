"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterEventNotFoundError = void 0;
class KpiMasterEventNotFoundError extends Error {
    constructor(message = 'KPI management event not found') {
        super(message);
        this.name = 'KpiMasterEventNotFoundError';
    }
}
exports.KpiMasterEventNotFoundError = KpiMasterEventNotFoundError;
//# sourceMappingURL=KpiMasterEventNotFoundError.js.map