"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiManagedSubjectNotFoundError = void 0;
class KpiManagedSubjectNotFoundError extends Error {
    constructor(message = 'KPI-managed subject not found (kpi_managed=true required)') {
        super(message);
        this.name = 'KpiManagedSubjectNotFoundError';
    }
}
exports.KpiManagedSubjectNotFoundError = KpiManagedSubjectNotFoundError;
//# sourceMappingURL=KpiManagedSubjectNotFoundError.js.map