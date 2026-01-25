"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterMapper = void 0;
exports.KpiMasterMapper = {
    toKpiMasterEventDto(apiDto) {
        return {
            id: apiDto.id,
            companyId: apiDto.companyId,
            eventCode: apiDto.eventCode,
            eventName: apiDto.eventName,
            fiscalYear: apiDto.fiscalYear,
            status: apiDto.status,
            isActive: apiDto.isActive,
            createdAt: apiDto.createdAt,
            updatedAt: apiDto.updatedAt,
            createdBy: apiDto.createdBy,
            updatedBy: apiDto.updatedBy,
        };
    },
    toKpiMasterItemDto(apiDto) {
        return {
            id: apiDto.id,
            kpiEventId: apiDto.kpiEventId,
            parentKpiItemId: apiDto.parentKpiItemId,
            kpiCode: apiDto.kpiCode,
            kpiName: apiDto.kpiName,
            kpiType: apiDto.kpiType,
            hierarchyLevel: apiDto.hierarchyLevel,
            refSubjectId: apiDto.refSubjectId,
            refKpiDefinitionId: apiDto.refKpiDefinitionId,
            refMetricId: apiDto.refMetricId,
            departmentStableId: apiDto.departmentStableId,
            departmentName: undefined,
            ownerEmployeeId: apiDto.ownerEmployeeId,
            ownerName: undefined,
            sortOrder: apiDto.sortOrder,
            isActive: apiDto.isActive,
            createdAt: apiDto.createdAt,
            updatedAt: apiDto.updatedAt,
        };
    },
    toKpiMasterItemDetailDto(apiDto, factAmounts, targetValues, actionPlans) {
        const baseItem = this.toKpiMasterItemDto(apiDto);
        const periodFacts = this.assemblePeriodFacts(apiDto.kpiType, factAmounts, targetValues);
        const actionPlansSummary = actionPlans.map((plan) => ({
            id: plan.id,
            planCode: plan.planCode,
            planName: plan.planName,
            status: plan.status,
            progress: plan.progress,
        }));
        return {
            ...baseItem,
            periodFacts,
            actionPlans: actionPlansSummary,
        };
    },
    assemblePeriodFacts(kpiType, factAmounts, targetValues) {
        const periodFacts = {};
        switch (kpiType) {
            case 'NON_FINANCIAL':
                for (const fact of factAmounts) {
                    periodFacts[fact.periodCode] = {
                        periodCode: fact.periodCode,
                        targetValue: fact.targetValue,
                        actualValue: fact.actualValue,
                        achievementRate: this.calculateAchievementRate(fact.actualValue, fact.targetValue),
                        notes: fact.notes,
                    };
                }
                break;
            case 'FINANCIAL':
            case 'METRIC':
                for (const target of targetValues) {
                    periodFacts[target.periodCode] = {
                        periodCode: target.periodCode,
                        targetValue: target.targetValue,
                        actualValue: undefined,
                        achievementRate: undefined,
                        notes: undefined,
                    };
                }
                break;
            default:
                break;
        }
        return periodFacts;
    },
    calculateAchievementRate(actualValue, targetValue) {
        if (actualValue === undefined || targetValue === undefined || targetValue === 0) {
            return undefined;
        }
        const rate = (actualValue / targetValue) * 100;
        return Math.round(rate * 10) / 10;
    },
};
//# sourceMappingURL=kpi-master.mapper.js.map