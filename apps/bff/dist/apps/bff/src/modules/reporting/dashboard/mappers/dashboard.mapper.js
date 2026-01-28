"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMapper = void 0;
exports.DashboardMapper = {
    toDashboard(api) {
        return {
            id: api.id,
            name: api.name,
            description: api.description,
            ownerType: api.ownerType,
            ownerId: api.ownerId,
            isActive: api.isActive,
            sortOrder: api.sortOrder,
            createdAt: api.createdAt,
            updatedAt: api.updatedAt,
            createdBy: api.createdBy,
            updatedBy: api.updatedBy,
        };
    },
    toWidget(api) {
        return {
            id: api.id,
            widgetType: api.widgetType,
            title: api.title,
            layout: api.layout,
            dataConfig: api.dataConfig,
            filterConfig: api.filterConfig,
            displayConfig: api.displayConfig,
            sortOrder: api.sortOrder,
        };
    },
    toDashboardDetail(api) {
        return {
            ...exports.DashboardMapper.toDashboard(api),
            globalFilterConfig: api.globalFilterConfig,
            widgets: api.widgets.map((w) => exports.DashboardMapper.toWidget(w)),
        };
    },
    toDashboardList(items, total, page, pageSize) {
        return {
            items: items.map((item) => exports.DashboardMapper.toDashboard(item)),
            total,
            page,
            pageSize,
        };
    },
    toTemplate(api) {
        return {
            id: api.id,
            name: api.name,
            description: api.description,
            widgetCount: api.widgets?.length ?? 0,
        };
    },
    toTemplateList(items) {
        return {
            templates: items.map((item) => exports.DashboardMapper.toTemplate(item)),
        };
    },
    toDataPoint(api) {
        return {
            label: api.label,
            value: api.value,
            compareValue: api.compareValue,
        };
    },
    toWidgetDataResponse(api) {
        return {
            widgetId: api.widgetId,
            dataPoints: api.dataPoints.map((dp) => exports.DashboardMapper.toDataPoint(dp)),
            difference: api.difference,
            unit: api.unit,
            meta: api.meta,
        };
    },
    toPlanEventOption(api) {
        return {
            id: api.id,
            eventCode: api.eventCode,
            eventName: api.eventName,
            scenarioType: api.scenarioType,
            fiscalYear: api.fiscalYear,
        };
    },
    toPlanVersionOption(api) {
        return {
            id: api.id,
            versionCode: api.versionCode,
            versionName: api.versionName,
            status: api.status,
        };
    },
    toDepartmentNode(api) {
        return {
            stableId: api.stableId,
            departmentCode: api.departmentCode,
            departmentName: api.departmentName,
            level: api.level,
            hasChildren: api.hasChildren,
            children: api.children?.map((c) => exports.DashboardMapper.toDepartmentNode(c)),
        };
    },
    toSelectorsResponse(api) {
        return {
            fiscalYears: api.fiscalYears,
            planEvents: api.planEvents.map((pe) => exports.DashboardMapper.toPlanEventOption(pe)),
            planVersions: api.planVersions.map((pv) => exports.DashboardMapper.toPlanVersionOption(pv)),
            departments: api.departments.map((d) => exports.DashboardMapper.toDepartmentNode(d)),
        };
    },
    toKpiDefinitionOption(api) {
        return {
            id: api.id,
            kpiCode: api.kpiCode,
            kpiName: api.kpiName,
            unit: api.unit,
        };
    },
    toKpiDefinitionOptionList(api) {
        return {
            items: api.items.map((item) => exports.DashboardMapper.toKpiDefinitionOption(item)),
        };
    },
};
//# sourceMappingURL=dashboard.mapper.js.map