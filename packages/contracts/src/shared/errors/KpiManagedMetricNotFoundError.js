"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiManagedMetricNotFoundError = void 0;
class KpiManagedMetricNotFoundError extends Error {
    constructor(message = 'KPI-managed metric not found (kpi_managed=true required)') {
        super(message);
        this.name = 'KpiManagedMetricNotFoundError';
    }
}
exports.KpiManagedMetricNotFoundError = KpiManagedMetricNotFoundError;
//# sourceMappingURL=KpiManagedMetricNotFoundError.js.map