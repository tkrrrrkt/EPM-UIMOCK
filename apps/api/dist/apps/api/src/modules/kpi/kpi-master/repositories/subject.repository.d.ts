import { PrismaService } from '../../../../prisma/prisma.service';
export declare class SubjectRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(tenantId: string, id: string): Promise<{
        id: string;
        subjectCode: string;
        subjectName: string;
        kpiManaged: boolean;
    } | null>;
}
