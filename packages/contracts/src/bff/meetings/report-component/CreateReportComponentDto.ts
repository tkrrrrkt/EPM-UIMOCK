import type { ReportComponentType, ReportDataSource, ComponentWidth, ComponentHeight } from '@epm/contracts/shared/enums/meetings';
import type { ComponentConfig } from './ComponentConfig';

/**
 * レポートコンポーネント作成リクエストDTO
 */
export interface CreateReportComponentDto {
  /** ページID */
  pageId: string;
  /** コンポーネントコード（必須、英数字アンダースコア、最大50文字） */
  componentCode: string;
  /** コンポーネント名（必須、最大200文字） */
  componentName: string;
  /** コンポーネントタイプ */
  componentType: ReportComponentType;
  /** データソース */
  dataSource: ReportDataSource;
  /** 幅（デフォルト: FULL） */
  width: ComponentWidth;
  /** 高さ */
  height?: ComponentHeight;
  /** 設定JSON（省略時はデフォルト設定が適用される） */
  configJson?: Partial<ComponentConfig>;
}
