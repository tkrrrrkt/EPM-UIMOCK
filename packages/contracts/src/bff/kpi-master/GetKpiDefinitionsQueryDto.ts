/**
 * 非財務KPI定義一覧取得クエリDTO
 */
export interface GetKpiDefinitionsQueryDto {
  /** 会社ID（必須） */
  companyId: string;
  /** キーワード検索（kpi_code または kpi_name） */
  keyword?: string;
}
