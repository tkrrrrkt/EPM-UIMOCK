import { KpiMasterItemDto } from './KpiMasterItemDto';

/**
 * KPI項目ツリーDTO（階層表示用）
 */
export interface KpiMasterItemTreeDto extends KpiMasterItemDto {
  /** 子KPI項目一覧（階層構造、BFF組み立て） */
  children: KpiMasterItemTreeDto[];
}
