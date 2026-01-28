import type {
  BffListKpiDefinitionsRequest,
  BffListKpiDefinitionsResponse,
  BffKpiDefinitionDetailResponse,
  BffCreateKpiDefinitionRequest,
  BffUpdateKpiDefinitionRequest,
} from "@epm/contracts/bff/kpi-definitions"

/**
 * KPI定義マスタ BFF Client Interface
 * SSoT: .kiro/specs/master-data/kpi-definitions/design.md
 */
export interface BffClient {
  /**
   * KPI定義一覧取得
   * design.md: GET /api/bff/master-data/kpi-definitions
   */
  listKpiDefinitions(request: BffListKpiDefinitionsRequest): Promise<BffListKpiDefinitionsResponse>

  /**
   * KPI定義詳細取得
   * design.md: GET /api/bff/master-data/kpi-definitions/:id
   */
  getKpiDefinitionById(id: string): Promise<BffKpiDefinitionDetailResponse | null>

  /**
   * KPI定義新規登録
   * design.md: POST /api/bff/master-data/kpi-definitions
   */
  createKpiDefinition(data: BffCreateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse>

  /**
   * KPI定義更新
   * design.md: PATCH /api/bff/master-data/kpi-definitions/:id
   */
  updateKpiDefinition(id: string, data: BffUpdateKpiDefinitionRequest): Promise<BffKpiDefinitionDetailResponse>

  /**
   * KPI定義無効化
   * design.md: POST /api/bff/master-data/kpi-definitions/:id/deactivate
   */
  deactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse>

  /**
   * KPI定義再有効化
   * design.md: POST /api/bff/master-data/kpi-definitions/:id/reactivate
   */
  reactivateKpiDefinition(id: string): Promise<BffKpiDefinitionDetailResponse>
}
