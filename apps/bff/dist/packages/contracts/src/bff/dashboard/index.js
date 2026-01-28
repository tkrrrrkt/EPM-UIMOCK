"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardErrorCode = exports.DisplayGranularity = exports.ScenarioType = exports.OwnerType = exports.DataSourceType = exports.WidgetType = void 0;
const dashboard_1 = require("../../shared/enums/dashboard");
Object.defineProperty(exports, "WidgetType", { enumerable: true, get: function () { return dashboard_1.WidgetType; } });
Object.defineProperty(exports, "DataSourceType", { enumerable: true, get: function () { return dashboard_1.DataSourceType; } });
Object.defineProperty(exports, "OwnerType", { enumerable: true, get: function () { return dashboard_1.OwnerType; } });
exports.ScenarioType = {
    BUDGET: 'BUDGET',
    FORECAST: 'FORECAST',
    ACTUAL: 'ACTUAL',
};
exports.DisplayGranularity = {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    HALF_YEARLY: 'HALF_YEARLY',
    YEARLY: 'YEARLY',
};
exports.DashboardErrorCode = {
    NOT_FOUND: 'DASHBOARD_NOT_FOUND',
    ACCESS_DENIED: 'DASHBOARD_ACCESS_DENIED',
    DELETE_FORBIDDEN: 'DASHBOARD_DELETE_FORBIDDEN',
    WIDGET_DATA_ERROR: 'DASHBOARD_WIDGET_DATA_ERROR',
    INVALID_FILTER_CONFIG: 'DASHBOARD_INVALID_FILTER_CONFIG',
};
//# sourceMappingURL=index.js.map