import type { BffClient } from "./BffClient"
import type {
  BffListKpiDefinitionsRequest,
  BffListKpiDefinitionsResponse,
  BffKpiDefinitionSummary,
  BffKpiDefinitionDetailResponse,
  BffCreateKpiDefinitionRequest,
  BffUpdateKpiDefinitionRequest,
  AggregationMethod,
  Direction,
} from "@epm/contracts/bff/kpi-definitions"

/**
 * KPI定義マスタ Mock BFF Client
 * SSoT: .kiro/specs/master-data/kpi-definitions/design.md
 */

// 内部データ型（詳細情報を含む）
interface KpiDefinitionData {
  id: string
  kpiCode: string
  kpiName: string
  description: string | null
  unit: string | null
  aggregationMethod: AggregationMethod
  direction: Direction | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const mockKpiDefinitions: KpiDefinitionData[] = [
  {
    id: "1",
    kpiCode: "CO2-001",
    kpiName: "CO2排出量削減率",
    description: "前年比でのCO2排出量削減率を測定する。サステナビリティ目標達成の重要指標。",
    unit: "%",
    aggregationMethod: "AVG",
    direction: "lower_is_better",
    isActive: true,
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "2",
    kpiCode: "CSAT-001",
    kpiName: "顧客満足度スコア",
    description: "顧客アンケートから算出する総合満足度スコア。100点満点で評価。",
    unit: "pt",
    aggregationMethod: "AVG",
    direction: "higher_is_better",
    isActive: true,
    createdAt: "2026-01-11T10:30:00Z",
    updatedAt: "2026-01-11T10:30:00Z",
  },
  {
    id: "3",
    kpiCode: "EMP-001",
    kpiName: "従業員エンゲージメントスコア",
    description: "定期的な従業員調査から算出するエンゲージメントスコア。",
    unit: "pt",
    aggregationMethod: "AVG",
    direction: "higher_is_better",
    isActive: true,
    createdAt: "2026-01-12T11:15:00Z",
    updatedAt: "2026-01-12T11:15:00Z",
  },
  {
    id: "4",
    kpiCode: "SAFETY-001",
    kpiName: "労働災害発生件数",
    description: "期間中に発生した労働災害の件数。ゼロ災害を目標とする。",
    unit: "件",
    aggregationMethod: "SUM",
    direction: "lower_is_better",
    isActive: true,
    createdAt: "2026-01-13T14:20:00Z",
    updatedAt: "2026-01-13T14:20:00Z",
  },
  {
    id: "5",
    kpiCode: "TRAIN-001",
    kpiName: "研修受講率",
    description: "対象期間における必須研修の受講完了率。",
    unit: "%",
    aggregationMethod: "EOP",
    direction: "higher_is_better",
    isActive: false,
    createdAt: "2026-01-14T08:45:00Z",
    updatedAt: "2026-01-15T16:30:00Z",
  },
  {
    id: "6",
    kpiCode: "NPS-001",
    kpiName: "NPS（ネットプロモータースコア）",
    description: "顧客がサービスを他者に推奨する可能性を示すスコア。",
    unit: "pt",
    aggregationMethod: "AVG",
    direction: "higher_is_better",
    isActive: true,
    createdAt: "2026-01-16T13:00:00Z",
    updatedAt: "2026-01-16T13:00:00Z",
  },
]

let kpiDefinitionsData = [...mockKpiDefinitions]

export class MockBffClient implements BffClient {
  private delay(ms = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * KPI定義一覧取得
   */
  async listKpiDefinitions(request: BffListKpiDefinitionsRequest): Promise<BffListKpiDefinitionsResponse> {
    await this.delay()

    let filtered = [...kpiDefinitionsData]

    // キーワード検索（KPIコード・KPI名部分一致）
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.kpiCode.toLowerCase().includes(keyword) ||
          d.kpiName.toLowerCase().includes(keyword),
      )
    }

    // 集計方法フィルタ
    if (request.aggregationMethod) {
      filtered = filtered.filter((d) => d.aggregationMethod === request.aggregationMethod)
    }

    // 有効/無効フィルタ
    if (request.isActive !== undefined) {
      filtered = filtered.filter((d) => d.isActive === request.isActive)
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

    // BffKpiDefinitionSummaryに変換
    const items: BffKpiDefinitionSummary[] = pagedItems.map((d) => ({
      id: d.id,
      kpiCode: d.kpiCode,
      kpiName: d.kpiName,
      unit: d.unit,
      aggregationMethod: d.aggregationMethod,
      direction: d.direction,
      isActive: d.isActive,
    }))

    return {
      items,
      totalCount,
      page,
      pageSize,
    }
  }

  /**
   * KPI定義詳細取得
   */
  async getKpiDefinitionById(id: string): Promise<BffKpiDefinitionDetailResponse | null> {
    await this.delay()
    const definition = kpiDefinitionsData.find((d) => d.id === id)
    if (!definition) return null

    return {
      id: definition.id,
      kpiCode: definition.kpiCode,
      kpiName: definition.kpiName,
      description: definition.description,
      unit: definition.unit,
      aggregationMethod: definition.aggregationMethod,
      direction: definition.direction,
      isActive: definition.isActive,
      createdAt: definition.createdAt,
      updatedAt: definition.updatedAt,
    }
  }

  /**
   * KPI定義新規登録
   */
  async createKpiDefinition(data: BffCreateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse> {
    await this.delay()

    // 重複チェック
    const duplicate = kpiDefinitionsData.find((d) => d.kpiCode === data.kpiCode)
    if (duplicate) {
      throw new Error("KPI_CODE_DUPLICATE")
    }

    const now = new Date().toISOString()
    const newDefinition: KpiDefinitionData = {
      id: String(Date.now()),
      kpiCode: data.kpiCode,
      kpiName: data.kpiName,
      description: data.description ?? null,
      unit: data.unit ?? null,
      aggregationMethod: data.aggregationMethod,
      direction: data.direction ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    kpiDefinitionsData = [...kpiDefinitionsData, newDefinition]

    return {
      id: newDefinition.id,
      kpiCode: newDefinition.kpiCode,
      kpiName: newDefinition.kpiName,
      description: newDefinition.description,
      unit: newDefinition.unit,
      aggregationMethod: newDefinition.aggregationMethod,
      direction: newDefinition.direction,
      isActive: newDefinition.isActive,
      createdAt: newDefinition.createdAt,
      updatedAt: newDefinition.updatedAt,
    }
  }

  /**
   * KPI定義更新
   */
  async updateKpiDefinition(id: string, data: BffUpdateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse> {
    await this.delay()

    const index = kpiDefinitionsData.findIndex((d) => d.id === id)
    if (index === -1) {
      throw new Error("KPI_DEFINITION_NOT_FOUND")
    }

    // KPIコード重複チェック（自分以外）
    if (data.kpiCode) {
      const duplicate = kpiDefinitionsData.find((d) => d.kpiCode === data.kpiCode && d.id !== id)
      if (duplicate) {
        throw new Error("KPI_CODE_DUPLICATE")
      }
    }

    const now = new Date().toISOString()
    const updatedDefinition: KpiDefinitionData = {
      ...kpiDefinitionsData[index],
      ...(data.kpiCode !== undefined && { kpiCode: data.kpiCode }),
      ...(data.kpiName !== undefined && { kpiName: data.kpiName }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.unit !== undefined && { unit: data.unit ?? null }),
      ...(data.aggregationMethod !== undefined && { aggregationMethod: data.aggregationMethod }),
      ...(data.direction !== undefined && { direction: data.direction }),
      updatedAt: now,
    }

    kpiDefinitionsData = [...kpiDefinitionsData.slice(0, index), updatedDefinition, ...kpiDefinitionsData.slice(index + 1)]

    return {
      id: updatedDefinition.id,
      kpiCode: updatedDefinition.kpiCode,
      kpiName: updatedDefinition.kpiName,
      description: updatedDefinition.description,
      unit: updatedDefinition.unit,
      aggregationMethod: updatedDefinition.aggregationMethod,
      direction: updatedDefinition.direction,
      isActive: updatedDefinition.isActive,
      createdAt: updatedDefinition.createdAt,
      updatedAt: updatedDefinition.updatedAt,
    }
  }

  /**
   * KPI定義無効化
   */
  async deactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse> {
    await this.delay()

    const index = kpiDefinitionsData.findIndex((d) => d.id === id)
    if (index === -1) {
      throw new Error("KPI_DEFINITION_NOT_FOUND")
    }

    if (!kpiDefinitionsData[index].isActive) {
      throw new Error("KPI_DEFINITION_ALREADY_INACTIVE")
    }

    const now = new Date().toISOString()
    const updatedDefinition: KpiDefinitionData = {
      ...kpiDefinitionsData[index],
      isActive: false,
      updatedAt: now,
    }

    kpiDefinitionsData = [...kpiDefinitionsData.slice(0, index), updatedDefinition, ...kpiDefinitionsData.slice(index + 1)]

    return {
      id: updatedDefinition.id,
      kpiCode: updatedDefinition.kpiCode,
      kpiName: updatedDefinition.kpiName,
      description: updatedDefinition.description,
      unit: updatedDefinition.unit,
      aggregationMethod: updatedDefinition.aggregationMethod,
      direction: updatedDefinition.direction,
      isActive: updatedDefinition.isActive,
      createdAt: updatedDefinition.createdAt,
      updatedAt: updatedDefinition.updatedAt,
    }
  }

  /**
   * KPI定義再有効化
   */
  async reactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse> {
    await this.delay()

    const index = kpiDefinitionsData.findIndex((d) => d.id === id)
    if (index === -1) {
      throw new Error("KPI_DEFINITION_NOT_FOUND")
    }

    if (kpiDefinitionsData[index].isActive) {
      throw new Error("KPI_DEFINITION_ALREADY_ACTIVE")
    }

    const now = new Date().toISOString()
    const updatedDefinition: KpiDefinitionData = {
      ...kpiDefinitionsData[index],
      isActive: true,
      updatedAt: now,
    }

    kpiDefinitionsData = [...kpiDefinitionsData.slice(0, index), updatedDefinition, ...kpiDefinitionsData.slice(index + 1)]

    return {
      id: updatedDefinition.id,
      kpiCode: updatedDefinition.kpiCode,
      kpiName: updatedDefinition.kpiName,
      description: updatedDefinition.description,
      unit: updatedDefinition.unit,
      aggregationMethod: updatedDefinition.aggregationMethod,
      direction: updatedDefinition.direction,
      isActive: updatedDefinition.isActive,
      createdAt: updatedDefinition.createdAt,
      updatedAt: updatedDefinition.updatedAt,
    }
  }
}
