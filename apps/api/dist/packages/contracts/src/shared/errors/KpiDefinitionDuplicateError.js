"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiDefinitionDuplicateError = void 0;
class KpiDefinitionDuplicateError extends Error {
    constructor(message = 'KPI definition with the same kpi_code already exists') {
        super(message);
        this.name = 'KpiDefinitionDuplicateError';
    }
}
exports.KpiDefinitionDuplicateError = KpiDefinitionDuplicateError;
//# sourceMappingURL=KpiDefinitionDuplicateError.js.map