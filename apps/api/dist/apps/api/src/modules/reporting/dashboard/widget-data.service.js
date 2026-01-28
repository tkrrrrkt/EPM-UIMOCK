"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetDataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const errors_1 = require("../../../../../../packages/contracts/src/shared/errors");
let WidgetDataService = class WidgetDataService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getData(tenantId, companyId, widget, filter) {
        await this.prisma.setTenantContext(tenantId);
        try {
            const sources = widget.dataConfig.sources;
            if (!sources || sources.length === 0) {
                return {
                    widgetId: widget.id,
                    dataPoints: [],
                    unit: null,
                };
            }
            const primarySource = sources[0];
            const dataPoints = await this.fetchDataBySourceType(tenantId, companyId, primarySource.type, primarySource.refId, filter);
            let difference;
            if (filter.compareEnabled && dataPoints.length > 0) {
                difference = this.calculateDifference(dataPoints);
            }
            return {
                widgetId: widget.id,
                dataPoints,
                difference,
                unit: this.getUnitForSource(primarySource.type),
                meta: {
                    sourceName: primarySource.label,
                    lastUpdated: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            throw new errors_1.WidgetDataError(`Failed to retrieve widget data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getKpiDefinitionOptions(tenantId, companyId) {
        await this.prisma.setTenantContext(tenantId);
        const definitions = await this.prisma.kpi_definitions.findMany({
            where: {
                tenant_id: tenantId,
                company_id: companyId,
                is_active: true,
            },
            select: {
                id: true,
                kpi_code: true,
                kpi_name: true,
                unit: true,
            },
            orderBy: { kpi_code: 'asc' },
        });
        return {
            items: definitions.map((def) => ({
                id: def.id,
                kpiCode: def.kpi_code,
                kpiName: def.kpi_name,
                unit: def.unit ?? null,
            })),
        };
    }
    async fetchDataBySourceType(tenantId, companyId, sourceType, refId, filter) {
        switch (sourceType) {
            case 'FACT':
                return this.fetchFactData(tenantId, refId, filter);
            case 'KPI':
                return this.fetchKpiData(tenantId, companyId, refId, filter);
            case 'METRIC':
                return this.fetchMetricData(tenantId, refId, filter);
            default:
                return [];
        }
    }
    async fetchFactData(tenantId, subjectStableId, filter) {
        const periods = this.generatePeriodLabels(filter.periodStart, filter.periodEnd, filter.displayGranularity);
        return periods.map((label, index) => ({
            label,
            value: Math.round(Math.random() * 1000000) + 500000,
            compareValue: filter.compareEnabled
                ? Math.round(Math.random() * 1000000) + 500000
                : undefined,
        }));
    }
    async fetchKpiData(tenantId, companyId, kpiDefinitionId, filter) {
        const eventId = await this.resolveLatestConfirmedKpiEventId(tenantId, companyId, filter.fiscalYear);
        if (!eventId) {
            return [];
        }
        const kpiData = await this.prisma.kpi_fact_amounts.findMany({
            where: {
                tenant_id: tenantId,
                company_id: companyId,
                kpi_event_id: eventId,
                kpi_definition_id: kpiDefinitionId,
                period_code: {
                    gte: filter.periodStart,
                    lte: filter.periodEnd,
                },
                ...(filter.departmentStableId && {
                    department_stable_id: filter.departmentStableId,
                }),
            },
            orderBy: { period_code: 'asc' },
        });
        return kpiData.map((d) => ({
            label: this.formatPeriodCode(d.period_code, filter.displayGranularity),
            value: d.actual_value ? Number(d.actual_value) : null,
            compareValue: filter.compareEnabled && d.target_value
                ? Number(d.target_value)
                : undefined,
        }));
    }
    async resolveLatestConfirmedKpiEventId(tenantId, companyId, fiscalYear) {
        const event = await this.prisma.kpi_master_events.findFirst({
            where: {
                tenant_id: tenantId,
                company_id: companyId,
                fiscal_year: fiscalYear,
                status: 'CONFIRMED',
                is_active: true,
            },
            orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
            select: { id: true },
        });
        return event?.id ?? null;
    }
    async fetchMetricData(tenantId, metricId, filter) {
        const periods = this.generatePeriodLabels(filter.periodStart, filter.periodEnd, filter.displayGranularity);
        return periods.map((label) => ({
            label,
            value: Math.round(Math.random() * 30 * 10) / 10,
            compareValue: filter.compareEnabled
                ? Math.round(Math.random() * 30 * 10) / 10
                : undefined,
        }));
    }
    calculateDifference(dataPoints) {
        const primarySum = dataPoints.reduce((sum, dp) => sum + (dp.value ?? 0), 0);
        const compareSum = dataPoints.reduce((sum, dp) => sum + (dp.compareValue ?? 0), 0);
        const diffValue = primarySum - compareSum;
        const diffRate = compareSum !== 0 ? (diffValue / compareSum) * 100 : null;
        return {
            value: diffValue,
            rate: diffRate !== null ? Math.round(diffRate * 10) / 10 : null,
        };
    }
    generatePeriodLabels(start, end, granularity) {
        const labels = [];
        const startYear = parseInt(start.substring(0, 4));
        const startMonth = parseInt(start.substring(4, 6));
        const endYear = parseInt(end.substring(0, 4));
        const endMonth = parseInt(end.substring(4, 6));
        let currentYear = startYear;
        let currentMonth = startMonth;
        while (currentYear < endYear ||
            (currentYear === endYear && currentMonth <= endMonth)) {
            switch (granularity) {
                case 'MONTHLY':
                    labels.push(`${currentYear}/${String(currentMonth).padStart(2, '0')}`);
                    currentMonth++;
                    if (currentMonth > 12) {
                        currentMonth = 1;
                        currentYear++;
                    }
                    break;
                case 'QUARTERLY':
                    const quarter = Math.ceil(currentMonth / 3);
                    labels.push(`${currentYear}/Q${quarter}`);
                    currentMonth += 3;
                    if (currentMonth > 12) {
                        currentMonth = currentMonth - 12;
                        currentYear++;
                    }
                    break;
                case 'HALF_YEARLY':
                    const half = currentMonth <= 6 ? 'H1' : 'H2';
                    labels.push(`${currentYear}/${half}`);
                    currentMonth += 6;
                    if (currentMonth > 12) {
                        currentMonth = currentMonth - 12;
                        currentYear++;
                    }
                    break;
                case 'YEARLY':
                    labels.push(`${currentYear}`);
                    currentYear++;
                    currentMonth = 1;
                    break;
                default:
                    labels.push(`${currentYear}/${String(currentMonth).padStart(2, '0')}`);
                    currentMonth++;
                    if (currentMonth > 12) {
                        currentMonth = 1;
                        currentYear++;
                    }
            }
            if (labels.length > 100)
                break;
        }
        return labels;
    }
    formatPeriodCode(periodCode, granularity) {
        if (periodCode.length >= 6) {
            const year = periodCode.substring(0, 4);
            const month = periodCode.substring(4, 6);
            return `${year}/${month}`;
        }
        return periodCode;
    }
    getUnitForSource(sourceType) {
        switch (sourceType) {
            case 'FACT':
                return '千円';
            case 'KPI':
                return null;
            case 'METRIC':
                return '%';
            default:
                return null;
        }
    }
};
exports.WidgetDataService = WidgetDataService;
exports.WidgetDataService = WidgetDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WidgetDataService);
//# sourceMappingURL=widget-data.service.js.map