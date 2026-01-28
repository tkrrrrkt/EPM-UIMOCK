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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterController = void 0;
const common_1 = require("@nestjs/common");
const kpi_master_event_service_1 = require("./services/kpi-master-event.service");
const kpi_master_item_service_1 = require("./services/kpi-master-item.service");
const kpi_definition_service_1 = require("./services/kpi-definition.service");
const kpi_fact_amount_service_1 = require("./services/kpi-fact-amount.service");
const kpi_target_value_service_1 = require("./services/kpi-target-value.service");
const errors_1 = require("../../../../../../packages/contracts/src/shared/errors");
let KpiMasterController = class KpiMasterController {
    constructor(kpiMasterEventService, kpiMasterItemService, kpiDefinitionService, kpiFactAmountService, kpiTargetValueService) {
        this.kpiMasterEventService = kpiMasterEventService;
        this.kpiMasterItemService = kpiMasterItemService;
        this.kpiDefinitionService = kpiDefinitionService;
        this.kpiFactAmountService = kpiFactAmountService;
        this.kpiTargetValueService = kpiTargetValueService;
    }
    async createEvent(tenantId, userId, companyId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        this.validateCompanyId(companyId);
        try {
            return await this.kpiMasterEventService.createEvent(tenantId, userId, {
                ...data,
                company_id: companyId,
            });
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterEventDuplicateError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async confirmEvent(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            return await this.kpiMasterEventService.confirmEvent(tenantId, id, userId);
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterEventNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof errors_1.KpiMasterEventAlreadyConfirmedError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async getEvents(tenantId, companyId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.kpiMasterEventService.findAllEvents(tenantId, {
            ...query,
            company_id: companyId,
        });
    }
    async getEvent(tenantId, id) {
        this.validateTenantId(tenantId);
        try {
            return await this.kpiMasterEventService.findEventById(tenantId, id);
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterEventNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async createItem(tenantId, userId, companyId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        this.validateCompanyId(companyId);
        try {
            return await this.kpiMasterItemService.createItem(tenantId, userId, {
                ...data,
                company_id: companyId,
            });
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterItemInvalidReferenceError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async updateItem(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        const userContext = this.extractUserContext(userId);
        try {
            return await this.kpiMasterItemService.updateItem(tenantId, id, userId, data, userContext);
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterItemNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof errors_1.KpiMasterItemAccessDeniedError) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw error;
        }
    }
    async deleteItem(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        const userContext = this.extractUserContext(userId);
        try {
            await this.kpiMasterItemService.deleteItem(tenantId, id, userId, userContext);
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterItemNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof errors_1.KpiMasterItemAccessDeniedError) {
                throw new common_1.ForbiddenException(error.message);
            }
            if (error instanceof errors_1.KpiMasterItemDeleteForbiddenError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async getItems(tenantId, userId, query) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        const userContext = this.extractUserContext(userId);
        return this.kpiMasterItemService.findAllItems(tenantId, query, userContext);
    }
    async getItem(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        const userContext = this.extractUserContext(userId);
        try {
            return await this.kpiMasterItemService.findItemById(tenantId, id, userContext);
        }
        catch (error) {
            if (error instanceof errors_1.KpiMasterItemNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof errors_1.KpiMasterItemAccessDeniedError) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw error;
        }
    }
    async getSelectableSubjects(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return [];
    }
    async getSelectableMetrics(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return [];
    }
    async createKpiDefinition(tenantId, userId, companyId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        this.validateCompanyId(companyId);
        try {
            return await this.kpiDefinitionService.createDefinition(tenantId, userId, {
                ...data,
                company_id: companyId,
            });
        }
        catch (error) {
            if (error instanceof errors_1.KpiDefinitionDuplicateError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async getKpiDefinitions(tenantId, companyId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.kpiDefinitionService.findAllDefinitions(tenantId, {
            ...query,
            company_id: companyId,
        });
    }
    async createFactAmount(tenantId, userId, companyId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        this.validateCompanyId(companyId);
        try {
            return await this.kpiFactAmountService.createFactAmount(tenantId, userId, {
                ...data,
                company_id: companyId,
            });
        }
        catch (error) {
            if (error instanceof errors_1.KpiFactAmountDuplicateError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async updateFactAmount(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            return await this.kpiFactAmountService.updateFactAmount(tenantId, id, userId, data);
        }
        catch (error) {
            if (error instanceof errors_1.KpiFactAmountNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async createTargetValue(tenantId, data) {
        this.validateTenantId(tenantId);
        try {
            return await this.kpiTargetValueService.createTargetValue(tenantId, data);
        }
        catch (error) {
            if (error instanceof errors_1.KpiTargetValueDuplicateError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async updateTargetValue(tenantId, id, data) {
        this.validateTenantId(tenantId);
        try {
            return await this.kpiTargetValueService.updateTargetValue(tenantId, id, data);
        }
        catch (error) {
            if (error instanceof errors_1.KpiTargetValueNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    validateTenantId(tenantId) {
        if (!tenantId) {
            throw new common_1.BadRequestException('x-tenant-id header is required');
        }
    }
    validateUserId(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('x-user-id header is required');
        }
    }
    validateCompanyId(companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException('x-company-id header is required');
        }
    }
    extractUserContext(userId) {
        return {
            userId,
            permissions: ['epm.kpi.admin'],
            controlDepartmentStableIds: [],
        };
    }
};
exports.KpiMasterController = KpiMasterController;
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id/confirm'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "confirmEvent", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getItem", null);
__decorate([
    (0, common_1.Get)('selectable-subjects'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getSelectableSubjects", null);
__decorate([
    (0, common_1.Get)('selectable-metrics'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getSelectableMetrics", null);
__decorate([
    (0, common_1.Post)('kpi-definitions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createKpiDefinition", null);
__decorate([
    (0, common_1.Get)('kpi-definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getKpiDefinitions", null);
__decorate([
    (0, common_1.Post)('fact-amounts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createFactAmount", null);
__decorate([
    (0, common_1.Put)('fact-amounts/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateFactAmount", null);
__decorate([
    (0, common_1.Post)('target-values'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createTargetValue", null);
__decorate([
    (0, common_1.Put)('target-values/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateTargetValue", null);
exports.KpiMasterController = KpiMasterController = __decorate([
    (0, common_1.Controller)('kpi/kpi-master'),
    __metadata("design:paramtypes", [kpi_master_event_service_1.KpiMasterEventService,
        kpi_master_item_service_1.KpiMasterItemService,
        kpi_definition_service_1.KpiDefinitionService,
        kpi_fact_amount_service_1.KpiFactAmountService,
        kpi_target_value_service_1.KpiTargetValueService])
], KpiMasterController);
//# sourceMappingURL=kpi-master.controller.js.map