"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterEventAlreadyConfirmedError = void 0;
class KpiMasterEventAlreadyConfirmedError extends Error {
    constructor(message = 'KPI management event is already confirmed') {
        super(message);
        this.name = 'KpiMasterEventAlreadyConfirmedError';
    }
}
exports.KpiMasterEventAlreadyConfirmedError = KpiMasterEventAlreadyConfirmedError;
//# sourceMappingURL=KpiMasterEventAlreadyConfirmedError.js.map