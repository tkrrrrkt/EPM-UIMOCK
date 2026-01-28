"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardNotFoundError = void 0;
class DashboardNotFoundError extends Error {
    constructor(message = 'Dashboard not found') {
        super(message);
        this.name = 'DashboardNotFoundError';
    }
}
exports.DashboardNotFoundError = DashboardNotFoundError;
//# sourceMappingURL=DashboardNotFoundError.js.map