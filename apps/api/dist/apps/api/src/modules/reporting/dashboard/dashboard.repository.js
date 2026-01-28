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
exports.DashboardRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let DashboardRepository = class DashboardRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        await this.prisma.setTenantContext(tenantId);
        const dashboards = await this.prisma.dashboards.findMany({
            where: {
                tenant_id: tenantId,
                deleted_at: null,
            },
            orderBy: { sort_order: 'asc' },
        });
        return dashboards.map((d) => this.mapToApiDto(d));
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const dashboard = await this.prisma.dashboards.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                deleted_at: null,
            },
        });
        return dashboard ? this.mapToApiDto(dashboard) : null;
    }
    async findByIdWithWidgets(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const dashboard = await this.prisma.dashboards.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                deleted_at: null,
            },
            include: {
                widgets: {
                    orderBy: { sort_order: 'asc' },
                },
            },
        });
        if (!dashboard) {
            return null;
        }
        return this.mapToDetailDto(dashboard);
    }
    async create(tenantId, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const dashboard = await this.prisma.dashboards.create({
            data: {
                tenant_id: tenantId,
                name: data.name,
                description: data.description ?? null,
                owner_type: 'USER',
                owner_id: userId ?? null,
                global_filter_config: (data.globalFilterConfig ?? {}),
                is_active: true,
                sort_order: 0,
                created_by: userId ?? null,
                updated_by: userId ?? null,
                widgets: data.widgets
                    ? {
                        create: data.widgets.map((w, index) => ({
                            widget_type: w.widgetType,
                            title: w.title,
                            layout: w.layout,
                            data_config: w.dataConfig,
                            filter_config: w.filterConfig,
                            display_config: w.displayConfig,
                            sort_order: w.sortOrder ?? index,
                        })),
                    }
                    : undefined,
            },
            include: {
                widgets: {
                    orderBy: { sort_order: 'asc' },
                },
            },
        });
        return this.mapToDetailDto(dashboard);
    }
    async update(tenantId, id, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.dashboards.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                deleted_at: null,
            },
        });
        if (!existing) {
            return null;
        }
        const dashboard = await this.prisma.$transaction(async (tx) => {
            await tx.dashboards.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.globalFilterConfig !== undefined && {
                        global_filter_config: data.globalFilterConfig,
                    }),
                    updated_by: userId ?? null,
                },
            });
            if (data.widgets !== undefined) {
                await tx.dashboard_widgets.deleteMany({
                    where: { dashboard_id: id },
                });
                if (data.widgets.length > 0) {
                    await tx.dashboard_widgets.createMany({
                        data: data.widgets.map((w, index) => ({
                            dashboard_id: id,
                            widget_type: w.widgetType,
                            title: w.title,
                            layout: w.layout,
                            data_config: w.dataConfig,
                            filter_config: w.filterConfig,
                            display_config: w.displayConfig,
                            sort_order: w.sortOrder ?? index,
                        })),
                    });
                }
            }
            return tx.dashboards.findFirst({
                where: { id },
                include: {
                    widgets: {
                        orderBy: { sort_order: 'asc' },
                    },
                },
            });
        });
        return dashboard ? this.mapToDetailDto(dashboard) : null;
    }
    async softDelete(tenantId, id, deletedBy) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.dashboards.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                deleted_at: null,
            },
        });
        if (!existing) {
            return false;
        }
        await this.prisma.dashboards.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: deletedBy,
            },
        });
        return true;
    }
    async findTemplates(tenantId) {
        await this.prisma.setTenantContext(tenantId);
        const templates = await this.prisma.dashboards.findMany({
            where: {
                tenant_id: tenantId,
                owner_type: 'SYSTEM',
                deleted_at: null,
            },
            orderBy: { sort_order: 'asc' },
        });
        return templates.map((t) => this.mapToApiDto(t));
    }
    async findTemplateByIdWithWidgets(tenantId, templateId) {
        return this.findByIdWithWidgets(tenantId, templateId);
    }
    mapToApiDto(dashboard) {
        return {
            id: dashboard.id,
            tenantId: dashboard.tenant_id,
            name: dashboard.name,
            description: dashboard.description ?? null,
            ownerType: dashboard.owner_type,
            ownerId: dashboard.owner_id ?? null,
            globalFilterConfig: dashboard.global_filter_config ?? {},
            isActive: dashboard.is_active,
            sortOrder: dashboard.sort_order,
            createdAt: dashboard.created_at.toISOString(),
            updatedAt: dashboard.updated_at.toISOString(),
            createdBy: dashboard.created_by ?? null,
            updatedBy: dashboard.updated_by ?? null,
            deletedAt: dashboard.deleted_at?.toISOString() ?? null,
            deletedBy: dashboard.deleted_by ?? null,
        };
    }
    mapToDetailDto(dashboard) {
        return {
            ...this.mapToApiDto(dashboard),
            widgets: (dashboard.widgets ?? []).map((w) => this.mapToWidgetDto(w)),
        };
    }
    mapToWidgetDto(widget) {
        return {
            id: widget.id,
            dashboardId: widget.dashboard_id,
            widgetType: widget.widget_type,
            title: widget.title,
            layout: widget.layout,
            dataConfig: widget.data_config,
            filterConfig: widget.filter_config,
            displayConfig: widget.display_config,
            sortOrder: widget.sort_order,
            createdAt: widget.created_at.toISOString(),
            updatedAt: widget.updated_at.toISOString(),
        };
    }
};
exports.DashboardRepository = DashboardRepository;
exports.DashboardRepository = DashboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardRepository);
//# sourceMappingURL=dashboard.repository.js.map