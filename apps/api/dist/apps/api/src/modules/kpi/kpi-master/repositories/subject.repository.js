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
exports.SubjectRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let SubjectRepository = class SubjectRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const subject = await this.prisma.subjects.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
            select: {
                id: true,
                subject_code: true,
                subject_name: true,
                kpi_managed: true,
            },
        });
        if (!subject) {
            return null;
        }
        return {
            id: subject.id,
            subjectCode: subject.subject_code,
            subjectName: subject.subject_name,
            kpiManaged: subject.kpi_managed,
        };
    }
};
exports.SubjectRepository = SubjectRepository;
exports.SubjectRepository = SubjectRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectRepository);
//# sourceMappingURL=subject.repository.js.map