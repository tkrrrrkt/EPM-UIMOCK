"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiTargetValueDuplicateError = void 0;
class KpiTargetValueDuplicateError extends Error {
    constructor(message = 'KPI target value with the same period already exists') {
        super(message);
        this.name = 'KpiTargetValueDuplicateError';
    }
}
exports.KpiTargetValueDuplicateError = KpiTargetValueDuplicateError;
//# sourceMappingURL=KpiTargetValueDuplicateError.js.map