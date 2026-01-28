import { Injectable } from '@nestjs/common';
import { SubjectRepository } from '../repositories/subject.repository';
import { MetricRepository } from '../repositories/metric.repository';

/**
 * SelectableOptionsService
 *
 * Purpose:
 * - Fetch selectable subjects/metrics for KPI item creation
 * - Only returns items with kpi_managed=true
 */
@Injectable()
export class SelectableOptionsService {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly metricRepository: MetricRepository,
  ) {}

  /**
   * Get selectable subjects (kpi_managed=true)
   */
  async findSelectableSubjects(tenantId: string, companyId?: string) {
    const subjects = await this.subjectRepository.findManyByKpiManaged(tenantId);
    return subjects;
  }

  /**
   * Get selectable metrics (kpi_managed=true)
   */
  async findSelectableMetrics(tenantId: string, companyId?: string) {
    const metrics = await this.metricRepository.findManyByKpiManaged(tenantId);
    return metrics;
  }
}
