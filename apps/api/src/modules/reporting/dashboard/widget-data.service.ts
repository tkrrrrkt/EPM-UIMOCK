/**
 * Widget Data Service
 *
 * @module reporting/dashboard
 *
 * Responsibilities:
 * - データソース種別（Fact/KPI/Metric）に応じたデータ取得
 * - フィルター適用（グローバル or ウィジェット固有）
 * - 比較データ（Compare）の取得・差異計算
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ApiWidgetDto,
  ApiWidgetDataResponseDto,
  ApiDataPoint,
  ResolvedFilterConfig,
  DataSourceType,
  ApiKpiDefinitionOptionListDto,
} from '@epm/contracts/api/dashboard';
import { WidgetDataError } from '@epm/contracts/shared/errors';

@Injectable()
export class WidgetDataService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ウィジェットデータ取得
   *
   * データソース種別に応じてデータを取得し、比較データも含めて返す
   */
  async getData(
    tenantId: string,
    companyId: string,
    widget: ApiWidgetDto,
    filter: ResolvedFilterConfig,
  ): Promise<ApiWidgetDataResponseDto> {
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

      // 最初のデータソースからデータ取得（複数ソースは今後拡張）
      const primarySource = sources[0];
      const dataPoints = await this.fetchDataBySourceType(
        tenantId,
        companyId,
        primarySource.type,
        primarySource.refId,
        filter,
      );

      // 差異計算（Compare ON時）
      let difference: { value: number | null; rate: number | null } | undefined;
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
    } catch (error) {
      throw new WidgetDataError(
        `Failed to retrieve widget data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * 非財務KPI定義の選択肢取得
   */
  async getKpiDefinitionOptions(
    tenantId: string,
    companyId: string,
  ): Promise<ApiKpiDefinitionOptionListDto> {
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

  /**
   * データソース種別に応じたデータ取得
   */
  private async fetchDataBySourceType(
    tenantId: string,
    companyId: string,
    sourceType: DataSourceType,
    refId: string,
    filter: ResolvedFilterConfig,
  ): Promise<ApiDataPoint[]> {
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

  /**
   * Factデータ取得（勘定科目残高）
   *
   * subjects.stable_id → facts テーブルから集計
   */
  private async fetchFactData(
    tenantId: string,
    subjectStableId: string,
    filter: ResolvedFilterConfig,
  ): Promise<ApiDataPoint[]> {
    // TODO: 実際のfactsテーブルからのデータ取得を実装
    // 現在はモックデータを返す
    const periods = this.generatePeriodLabels(
      filter.periodStart,
      filter.periodEnd,
      filter.displayGranularity,
    );

    return periods.map((label, index) => ({
      label,
      value: Math.round(Math.random() * 1000000) + 500000, // モックデータ
      compareValue: filter.compareEnabled
        ? Math.round(Math.random() * 1000000) + 500000
        : undefined,
    }));
  }

  /**
   * KPIデータ取得
   *
   * kpi_definitions.id → kpi_fact_amounts テーブルから取得
   */
  private async fetchKpiData(
    tenantId: string,
    companyId: string,
    kpiDefinitionId: string,
    filter: ResolvedFilterConfig,
  ): Promise<ApiDataPoint[]> {
    const eventId = await this.resolveLatestConfirmedKpiEventId(
      tenantId,
      companyId,
      filter.fiscalYear,
    );

    if (!eventId) {
      return [];
    }

    // kpi_fact_amountsからデータ取得
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

  /**
   * Resolve latest CONFIRMED KPI master event for fiscal year
   */
  private async resolveLatestConfirmedKpiEventId(
    tenantId: string,
    companyId: string,
    fiscalYear: number,
  ): Promise<string | null> {
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

  /**
   * Metricデータ取得（計算指標）
   *
   * metrics.id → formula評価
   */
  private async fetchMetricData(
    tenantId: string,
    metricId: string,
    filter: ResolvedFilterConfig,
  ): Promise<ApiDataPoint[]> {
    // TODO: metricsテーブルからformula取得し、計算を実行
    // 現在はモックデータを返す
    const periods = this.generatePeriodLabels(
      filter.periodStart,
      filter.periodEnd,
      filter.displayGranularity,
    );

    return periods.map((label) => ({
      label,
      value: Math.round(Math.random() * 30 * 10) / 10, // 0-30%のモック値
      compareValue: filter.compareEnabled
        ? Math.round(Math.random() * 30 * 10) / 10
        : undefined,
    }));
  }

  /**
   * 差異計算（合計値の差異と差異率）
   */
  private calculateDifference(
    dataPoints: ApiDataPoint[],
  ): { value: number | null; rate: number | null } {
    const primarySum = dataPoints.reduce(
      (sum, dp) => sum + (dp.value ?? 0),
      0,
    );
    const compareSum = dataPoints.reduce(
      (sum, dp) => sum + (dp.compareValue ?? 0),
      0,
    );

    const diffValue = primarySum - compareSum;
    const diffRate = compareSum !== 0 ? (diffValue / compareSum) * 100 : null;

    return {
      value: diffValue,
      rate: diffRate !== null ? Math.round(diffRate * 10) / 10 : null,
    };
  }

  /**
   * 期間ラベル生成
   */
  private generatePeriodLabels(
    start: string,
    end: string,
    granularity: string,
  ): string[] {
    const labels: string[] = [];
    const startYear = parseInt(start.substring(0, 4));
    const startMonth = parseInt(start.substring(4, 6));
    const endYear = parseInt(end.substring(0, 4));
    const endMonth = parseInt(end.substring(4, 6));

    let currentYear = startYear;
    let currentMonth = startMonth;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
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

      // 無限ループ防止
      if (labels.length > 100) break;
    }

    return labels;
  }

  /**
   * 期間コードをフォーマット
   */
  private formatPeriodCode(periodCode: string, granularity: string): string {
    if (periodCode.length >= 6) {
      const year = periodCode.substring(0, 4);
      const month = periodCode.substring(4, 6);
      return `${year}/${month}`;
    }
    return periodCode;
  }

  /**
   * データソース種別に応じた単位取得
   */
  private getUnitForSource(sourceType: DataSourceType): string | null {
    switch (sourceType) {
      case 'FACT':
        return '千円';
      case 'KPI':
        return null; // KPI定義から取得すべき
      case 'METRIC':
        return '%';
      default:
        return null;
    }
  }
}
