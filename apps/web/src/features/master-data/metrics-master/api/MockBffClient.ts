import type { BffClient } from "./BffClient"
import type {
  BffListMetricsRequest,
  BffListMetricsResponse,
  BffMetricSummary,
  BffMetricDetailResponse,
  BffCreateMetricRequest,
  BffUpdateMetricRequest,
  MetricType,
} from "@epm/contracts/bff/metrics-master"

/**
 * 指標マスタ Mock BFF Client
 * SSoT: .kiro/specs/master-data/metrics-master/design.md
 */

// 内部データ型（詳細情報を含む）
interface MetricData {
  id: string
  metricCode: string
  metricName: string
  metricType: MetricType
  resultMeasureKind: string
  unit: string | null
  scale: number
  formulaExpr: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const mockMetrics: MetricData[] = [
  {
    id: "1",
    metricCode: "EBITDA",
    metricName: "EBITDA",
    metricType: "FIN_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "円",
    scale: 0,
    formulaExpr: 'SUB("OP") + SUB("DA")',
    description: "営業利益 + 減価償却費",
    isActive: true,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "2",
    metricCode: "GP_MARGIN",
    metricName: "粗利率",
    metricType: "KPI_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "%",
    scale: 2,
    formulaExpr: 'SUB("GP") / SUB("REV") * 100',
    description: "粗利益 ÷ 売上高 × 100",
    isActive: true,
    createdAt: "2024-01-16T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z",
  },
  {
    id: "3",
    metricCode: "OP_MARGIN",
    metricName: "営業利益率",
    metricType: "KPI_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "%",
    scale: 2,
    formulaExpr: 'SUB("OP") / SUB("REV") * 100',
    description: "営業利益 ÷ 売上高 × 100",
    isActive: true,
    createdAt: "2024-01-17T11:15:00Z",
    updatedAt: "2024-01-17T11:15:00Z",
  },
  {
    id: "4",
    metricCode: "ROE",
    metricName: "自己資本利益率",
    metricType: "KPI_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "%",
    scale: 2,
    formulaExpr: 'SUB("NI") / SUB("EQ") * 100',
    description: "当期純利益 ÷ 自己資本 × 100",
    isActive: true,
    createdAt: "2024-01-18T14:20:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "5",
    metricCode: "NI",
    metricName: "当期純利益",
    metricType: "FIN_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "円",
    scale: 0,
    formulaExpr: 'SUB("OI") - SUB("TAX")',
    description: "経常利益 - 法人税等",
    isActive: false,
    createdAt: "2024-01-19T08:45:00Z",
    updatedAt: "2024-01-20T16:30:00Z",
  },
  {
    id: "6",
    metricCode: "FCF",
    metricName: "フリーキャッシュフロー",
    metricType: "FIN_METRIC",
    resultMeasureKind: "AMOUNT",
    unit: "円",
    scale: 0,
    formulaExpr: 'SUB("OCF") - SUB("CAPEX")',
    description: "営業キャッシュフロー - 設備投資",
    isActive: true,
    createdAt: "2024-01-21T13:00:00Z",
    updatedAt: "2024-01-21T13:00:00Z",
  },
]

let metricsData = [...mockMetrics]

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 指標一覧取得
   */
  async listMetrics(request: BffListMetricsRequest): Promise<BffListMetricsResponse> {
    await this.delay()

    let filtered = [...metricsData]

    // キーワード検索（指標コード・指標名部分一致）
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.metricCode.toLowerCase().includes(keyword) ||
          m.metricName.toLowerCase().includes(keyword),
      )
    }

    // 指標タイプフィルタ
    if (request.metricType) {
      filtered = filtered.filter((m) => m.metricType === request.metricType)
    }

    // 有効/無効フィルタ
    if (request.isActive !== undefined) {
      filtered = filtered.filter((m) => m.isActive === request.isActive)
    }

    // ソート
    if (request.sortBy) {
      const sortBy = request.sortBy
      const sortOrder = request.sortOrder || "asc"
      filtered.sort((a, b) => {
        const aVal = a[sortBy] ?? ""
        const bVal = b[sortBy] ?? ""
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    // ページネーション
    const page = request.page || 1
    const pageSize = request.pageSize || 50
    const totalCount = filtered.length
    const startIndex = (page - 1) * pageSize
    const pagedItems = filtered.slice(startIndex, startIndex + pageSize)

    // BffMetricSummaryに変換
    const items: BffMetricSummary[] = pagedItems.map((m) => ({
      id: m.id,
      metricCode: m.metricCode,
      metricName: m.metricName,
      metricType: m.metricType,
      unit: m.unit,
      isActive: m.isActive,
    }))

    return {
      items,
      totalCount,
      page,
      pageSize,
    }
  }

  /**
   * 指標詳細取得
   */
  async getMetricById(metricId: string): Promise<BffMetricDetailResponse | null> {
    await this.delay()
    const metric = metricsData.find((m) => m.id === metricId)
    if (!metric) return null

    return {
      id: metric.id,
      metricCode: metric.metricCode,
      metricName: metric.metricName,
      metricType: metric.metricType,
      resultMeasureKind: metric.resultMeasureKind,
      unit: metric.unit,
      scale: metric.scale,
      formulaExpr: metric.formulaExpr,
      description: metric.description,
      isActive: metric.isActive,
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt,
    }
  }

  /**
   * 指標新規登録
   */
  async createMetric(data: BffCreateMetricRequest): Promise<BffMetricDetailResponse> {
    await this.delay()

    // 重複チェック
    const duplicate = metricsData.find((m) => m.metricCode === data.metricCode)
    if (duplicate) {
      throw new Error("METRIC_CODE_DUPLICATE")
    }

    const now = new Date().toISOString()
    const newMetric: MetricData = {
      id: String(Date.now()),
      metricCode: data.metricCode,
      metricName: data.metricName,
      metricType: data.metricType,
      resultMeasureKind: data.resultMeasureKind,
      unit: data.unit ?? null,
      scale: data.scale ?? 0,
      formulaExpr: data.formulaExpr,
      description: data.description ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    metricsData = [...metricsData, newMetric]

    return {
      id: newMetric.id,
      metricCode: newMetric.metricCode,
      metricName: newMetric.metricName,
      metricType: newMetric.metricType,
      resultMeasureKind: newMetric.resultMeasureKind,
      unit: newMetric.unit,
      scale: newMetric.scale,
      formulaExpr: newMetric.formulaExpr,
      description: newMetric.description,
      isActive: newMetric.isActive,
      createdAt: newMetric.createdAt,
      updatedAt: newMetric.updatedAt,
    }
  }

  /**
   * 指標更新
   */
  async updateMetric(metricId: string, data: BffUpdateMetricRequest): Promise<BffMetricDetailResponse> {
    await this.delay()

    const index = metricsData.findIndex((m) => m.id === metricId)
    if (index === -1) {
      throw new Error("METRIC_NOT_FOUND")
    }

    // 指標コード重複チェック（自分以外）
    if (data.metricCode) {
      const duplicate = metricsData.find((m) => m.metricCode === data.metricCode && m.id !== metricId)
      if (duplicate) {
        throw new Error("METRIC_CODE_DUPLICATE")
      }
    }

    const now = new Date().toISOString()
    const updatedMetric: MetricData = {
      ...metricsData[index],
      ...(data.metricCode !== undefined && { metricCode: data.metricCode }),
      ...(data.metricName !== undefined && { metricName: data.metricName }),
      ...(data.metricType !== undefined && { metricType: data.metricType }),
      ...(data.resultMeasureKind !== undefined && { resultMeasureKind: data.resultMeasureKind }),
      ...(data.unit !== undefined && { unit: data.unit ?? null }),
      ...(data.scale !== undefined && { scale: data.scale }),
      ...(data.formulaExpr !== undefined && { formulaExpr: data.formulaExpr }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      updatedAt: now,
    }

    metricsData = [...metricsData.slice(0, index), updatedMetric, ...metricsData.slice(index + 1)]

    return {
      id: updatedMetric.id,
      metricCode: updatedMetric.metricCode,
      metricName: updatedMetric.metricName,
      metricType: updatedMetric.metricType,
      resultMeasureKind: updatedMetric.resultMeasureKind,
      unit: updatedMetric.unit,
      scale: updatedMetric.scale,
      formulaExpr: updatedMetric.formulaExpr,
      description: updatedMetric.description,
      isActive: updatedMetric.isActive,
      createdAt: updatedMetric.createdAt,
      updatedAt: updatedMetric.updatedAt,
    }
  }

  /**
   * 指標無効化
   */
  async deactivateMetric(metricId: string): Promise<BffMetricDetailResponse> {
    await this.delay()

    const index = metricsData.findIndex((m) => m.id === metricId)
    if (index === -1) {
      throw new Error("METRIC_NOT_FOUND")
    }

    if (!metricsData[index].isActive) {
      throw new Error("METRIC_ALREADY_INACTIVE")
    }

    const now = new Date().toISOString()
    const updatedMetric: MetricData = {
      ...metricsData[index],
      isActive: false,
      updatedAt: now,
    }

    metricsData = [...metricsData.slice(0, index), updatedMetric, ...metricsData.slice(index + 1)]

    return {
      id: updatedMetric.id,
      metricCode: updatedMetric.metricCode,
      metricName: updatedMetric.metricName,
      metricType: updatedMetric.metricType,
      resultMeasureKind: updatedMetric.resultMeasureKind,
      unit: updatedMetric.unit,
      scale: updatedMetric.scale,
      formulaExpr: updatedMetric.formulaExpr,
      description: updatedMetric.description,
      isActive: updatedMetric.isActive,
      createdAt: updatedMetric.createdAt,
      updatedAt: updatedMetric.updatedAt,
    }
  }

  /**
   * 指標再有効化
   */
  async reactivateMetric(metricId: string): Promise<BffMetricDetailResponse> {
    await this.delay()

    const index = metricsData.findIndex((m) => m.id === metricId)
    if (index === -1) {
      throw new Error("METRIC_NOT_FOUND")
    }

    if (metricsData[index].isActive) {
      throw new Error("METRIC_ALREADY_ACTIVE")
    }

    const now = new Date().toISOString()
    const updatedMetric: MetricData = {
      ...metricsData[index],
      isActive: true,
      updatedAt: now,
    }

    metricsData = [...metricsData.slice(0, index), updatedMetric, ...metricsData.slice(index + 1)]

    return {
      id: updatedMetric.id,
      metricCode: updatedMetric.metricCode,
      metricName: updatedMetric.metricName,
      metricType: updatedMetric.metricType,
      resultMeasureKind: updatedMetric.resultMeasureKind,
      unit: updatedMetric.unit,
      scale: updatedMetric.scale,
      formulaExpr: updatedMetric.formulaExpr,
      description: updatedMetric.description,
      isActive: updatedMetric.isActive,
      createdAt: updatedMetric.createdAt,
      updatedAt: updatedMetric.updatedAt,
    }
  }
}
