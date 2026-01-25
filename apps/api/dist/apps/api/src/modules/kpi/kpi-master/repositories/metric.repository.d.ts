import { PrismaService } from '../../../../prisma/prisma.service';
export declare class MetricRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(tenantId: string, id: string): Promise<{
        id: string;
        metricCode: string;
        metricName: string;
        kpiManaged: boolean;
    } | null>;
}
