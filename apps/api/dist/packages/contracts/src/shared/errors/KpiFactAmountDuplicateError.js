"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiFactAmountDuplicateError = void 0;
class KpiFactAmountDuplicateError extends Error {
    constructor(message = 'KPI fact amount with the same period already exists') {
        super(message);
        this.name = 'KpiFactAmountDuplicateError';
    }
}
exports.KpiFactAmountDuplicateError = KpiFactAmountDuplicateError;
//# sourceMappingURL=KpiFactAmountDuplicateError.js.map