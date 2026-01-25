import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * MetricRepository (Minimal implementation for KPI Master validation)
 *
 * Purpose:
 * - Verify metric existence and kpi_managed flag for METRIC KPI validation
 * - Follows same multi-tenant patterns as other repositories
 */
@Injectable()
export class MetricRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find metric by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Metric ID
   * @returns Metric with kpi_managed flag or null if not found
   */
  async findById(
    tenantId: string,
    id: string,
  ): Promise<{ id: string; metricCode: string; metricName: string; kpiManaged: boolean } | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const metric = await this.prisma.metrics.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        id,
        is_active: true,
      },
      select: {
        id: true,
        metric_code: true,
        metric_name: true,
        kpi_managed: true,
      },
    });

    if (!metric) {
      return null;
    }

    return {
      id: metric.id,
      metricCode: metric.metric_code,
      metricName: metric.metric_name,
      kpiManaged: metric.kpi_managed,
    };
  }
}
