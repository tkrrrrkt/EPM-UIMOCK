import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

/**
 * SubjectRepository (Minimal implementation for KPI Master validation)
 *
 * Purpose:
 * - Verify subject existence and kpi_managed flag for FINANCIAL KPI validation
 * - Follows same multi-tenant patterns as other repositories
 */
@Injectable()
export class SubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find subject by ID
   *
   * @param tenantId - Tenant ID (required)
   * @param id - Subject ID
   * @returns Subject with kpi_managed flag or null if not found
   */
  async findById(
    tenantId: string,
    id: string,
  ): Promise<{ id: string; subjectCode: string; subjectName: string; kpiManaged: boolean } | null> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const subject = await this.prisma.subjects.findFirst({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
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

  /**
   * Find all subjects with kpi_managed=true
   *
   * @param tenantId - Tenant ID (required)
   * @returns Array of subjects with kpi_managed=true
   */
  async findManyByKpiManaged(
    tenantId: string,
  ): Promise<Array<{ id: string; subjectCode: string; subjectName: string; kpiManaged: boolean }>> {
    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenantId);

    // Query with tenant_id double-guard
    const subjects = await this.prisma.subjects.findMany({
      where: {
        tenant_id: tenantId, // Required: tenant_id in WHERE clause
        kpi_managed: true,
        is_active: true,
      },
      select: {
        id: true,
        subject_code: true,
        subject_name: true,
        kpi_managed: true,
      },
      orderBy: {
        subject_code: 'asc',
      },
    });

    return subjects.map((subject) => ({
      id: subject.id,
      subjectCode: subject.subject_code,
      subjectName: subject.subject_name,
      kpiManaged: subject.kpi_managed,
    }));
  }
}
