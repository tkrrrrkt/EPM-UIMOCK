"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAccessDeniedError = void 0;
class DashboardAccessDeniedError extends Error {
    constructor(message = 'Dashboard access denied') {
        super(message);
        this.name = 'DashboardAccessDeniedError';
    }
}
exports.DashboardAccessDeniedError = DashboardAccessDeniedError;
//# sourceMappingURL=DashboardAccessDeniedError.js.map