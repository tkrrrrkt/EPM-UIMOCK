"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardDeleteForbiddenError = void 0;
class DashboardDeleteForbiddenError extends Error {
    constructor(message = 'System template dashboard cannot be deleted') {
        super(message);
        this.name = 'DashboardDeleteForbiddenError';
    }
}
exports.DashboardDeleteForbiddenError = DashboardDeleteForbiddenError;
//# sourceMappingURL=DashboardDeleteForbiddenError.js.map