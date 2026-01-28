"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKpiCardConfig = isKpiCardConfig;
exports.isTableConfig = isTableConfig;
exports.isChartConfig = isChartConfig;
exports.isSubmissionDisplayConfig = isSubmissionDisplayConfig;
exports.isReportLinkConfig = isReportLinkConfig;
exports.isActionListConfig = isActionListConfig;
exports.isSnapshotCompareConfig = isSnapshotCompareConfig;
exports.isKpiDashboardConfig = isKpiDashboardConfig;
exports.isApProgressConfig = isApProgressConfig;
function isKpiCardConfig(config) {
    return 'subjectIds' in config && 'layout' in config && !('chartType' in config);
}
function isTableConfig(config) {
    return 'rowAxis' in config && 'compareMode' in config;
}
function isChartConfig(config) {
    return 'chartType' in config && 'xAxis' in config;
}
function isSubmissionDisplayConfig(config) {
    return 'displayMode' in config && ('sectionIds' in config || 'showOrganizationHierarchy' in config);
}
function isReportLinkConfig(config) {
    return 'links' in config && Array.isArray(config.links);
}
function isActionListConfig(config) {
    return 'allowStatusChange' in config || ('filterStatus' in config && !('compareTarget' in config));
}
function isSnapshotCompareConfig(config) {
    return 'compareTarget' in config && 'metrics' in config;
}
function isKpiDashboardConfig(config) {
    return 'kpiDefinitionIds' in config || ('filterByStatus' in config && 'showChart' in config);
}
function isApProgressConfig(config) {
    return 'actionPlanIds' in config || 'showGantt' in config || 'showKanban' in config;
}
//# sourceMappingURL=ComponentConfig.js.map