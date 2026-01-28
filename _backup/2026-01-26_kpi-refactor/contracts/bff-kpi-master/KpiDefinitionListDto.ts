import { KpiDefinitionDto } from './KpiDefinitionDto';

/**
 * 非財務KPI定義一覧DTO
 */
export interface KpiDefinitionListDto {
  /** KPI定義一覧 */
  definitions: KpiDefinitionDto[];
}
