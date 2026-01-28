"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterMapper = void 0;
class KpiMasterMapper {
    static toEventList(items, total, page, pageSize) {
        return {
            items: items.map(this.toEventDto),
            total,
            page,
            pageSize,
        };
    }
    static toEventDto(event) {
        return {
            id: event.id,
            eventCode: event.event_code,
            eventName: event.event_name,
            fiscalYear: event.fiscal_year,
            status: event.status,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
        };
    }
    static toEventDetail(event) {
        return {
            ...this.toEventDto(event),
            kpiItems: [],
        };
    }
    static toCreateEventApiDto(data, companyId) {
        return {
            company_id: companyId,
            event_code: data.eventCode,
            event_name: data.eventName,
            fiscal_year: data.fiscalYear,
        };
    }
    static toItemList(items) {
        return items.map(this.toItemDto);
    }
    static toItemDto(item) {
        return {
            id: item.id,
            eventId: item.event_id,
            kpiCode: item.kpi_code,
            kpiName: item.kpi_name,
            kpiType: item.kpi_type,
            hierarchyLevel: item.hierarchy_level,
            parentKpiItemId: item.parent_kpi_item_id,
            departmentStableId: item.department_stable_id,
            departmentName: undefined,
            ownerEmployeeId: item.owner_employee_id,
            ownerEmployeeName: undefined,
            unit: item.unit,
            achievementRate: this.calculateAchievementRate(0, 0),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        };
    }
    static toItemDetail(item) {
        return {
            ...this.toItemDto(item),
            factAmounts: [],
            actionPlans: [],
        };
    }
    static toCreateItemApiDto(data, companyId) {
        return {
            company_id: companyId,
            event_id: data.eventId,
            kpi_code: data.kpiCode,
            kpi_name: data.kpiName,
            kpi_type: data.kpiType,
            hierarchy_level: data.hierarchyLevel,
            parent_kpi_item_id: data.parentKpiItemId,
            ref_subject_id: data.refSubjectId,
            ref_kpi_definition_id: data.refKpiDefinitionId,
            ref_metric_id: data.refMetricId,
            department_stable_id: data.departmentStableId,
            owner_employee_id: data.ownerEmployeeId,
            unit: data.unit,
        };
    }
    static toUpdateItemApiDto(data) {
        return {
            kpi_name: data.kpiName,
            department_stable_id: data.departmentStableId,
            owner_employee_id: data.ownerEmployeeId,
            unit: data.unit,
        };
    }
    static toSelectableSubjectList(subjects) {
        return {
            subjects: subjects.map((s) => ({
                id: s.id,
                subjectCode: s.subject_code,
                subjectName: s.subject_name,
                subjectType: s.subject_type,
            })),
        };
    }
    static toSelectableMetricList(metrics) {
        return {
            metrics: metrics.map((m) => ({
                id: m.id,
                metricCode: m.metric_code,
                metricName: m.metric_name,
                formula: m.formula,
            })),
        };
    }
    static toDefinitionList(items, total, page, pageSize) {
        return {
            items: items.map(this.toDefinitionDto),
            total,
            page,
            pageSize,
        };
    }
    static toDefinitionDto(definition) {
        return {
            id: definition.id,
            kpiCode: definition.kpi_code,
            kpiName: definition.kpi_name,
            description: definition.description,
            unit: definition.unit,
            aggregationMethod: definition.aggregation_method,
            direction: definition.direction,
            createdAt: definition.created_at,
            updatedAt: definition.updated_at,
        };
    }
    static toCreateDefinitionApiDto(data, companyId) {
        return {
            company_id: companyId,
            kpi_code: data.kpiCode,
            kpi_name: data.kpiName,
            description: data.description,
            unit: data.unit,
            aggregation_method: data.aggregationMethod,
            direction: data.direction,
        };
    }
    static toFactAmountDto(factAmount, kpiMasterItemIdOverride) {
        return {
            id: factAmount.id,
            kpiMasterItemId: kpiMasterItemIdOverride || factAmount.kpi_definition_id,
            periodCode: factAmount.period_code,
            periodStartDate: factAmount.period_start_date,
            periodEndDate: factAmount.period_end_date,
            targetValue: factAmount.target_value,
            actualValue: factAmount.actual_value,
            achievementRate: this.calculateAchievementRate(factAmount.actual_value, factAmount.target_value),
            createdAt: factAmount.created_at,
            updatedAt: factAmount.updated_at,
        };
    }
    static toCreateFactAmountApiDto(data, context) {
        return {
            event_id: context.eventId,
            kpi_definition_id: context.kpiDefinitionId,
            period_code: data.periodCode,
            period_start_date: data.periodStartDate,
            period_end_date: data.periodEndDate,
            target_value: data.targetValue,
            actual_value: data.actualValue,
        };
    }
    static toUpdateFactAmountApiDto(data) {
        return {
            target_value: data.targetValue,
            actual_value: data.actualValue,
        };
    }
    static toTargetValueDto(targetValue) {
        return {
            id: targetValue.id,
            kpiMasterItemId: targetValue.kpi_master_item_id,
            periodCode: targetValue.period_code,
            targetValue: targetValue.target_value,
            createdAt: targetValue.created_at,
            updatedAt: targetValue.updated_at,
        };
    }
    static toCreateTargetValueApiDto(data) {
        return {
            kpi_master_item_id: data.kpiMasterItemId,
            period_code: data.periodCode,
            target_value: data.targetValue,
        };
    }
    static toUpdateTargetValueApiDto(data) {
        return {
            target_value: data.targetValue,
        };
    }
    static calculateAchievementRate(actual, target) {
        if (actual == null || target == null || target === 0) {
            return undefined;
        }
        return Math.round((actual / target) * 1000) / 10;
    }
}
exports.KpiMasterMapper = KpiMasterMapper;
//# sourceMappingURL=kpi-master.mapper.js.map