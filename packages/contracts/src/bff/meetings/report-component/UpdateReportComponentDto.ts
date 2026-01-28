import type { ReportComponentType, ReportDataSource, ComponentWidth, ComponentHeight } from '@epm/contracts/shared/enums/meetings';
import type { ComponentConfig } from './ComponentConfig';

/**
 * レポートコンポーネント更新リクエストDTO
 */
export interface UpdateReportComponentDto {
  /** コンポーネントコード */
  componentCode?: string;
  /** コンポーネント名 */
  componentName?: string;
  /** コンポーネントタイプ（変更時はconfigJsonがリセットされる） */
  componentType?: ReportComponentType;
  /** データソース */
  dataSource?: ReportDataSource;
  /** 幅 */
  width?: ComponentWidth;
  /** 高さ */
  height?: ComponentHeight;
  /** 設定JSON */
  configJson?: Partial<ComponentConfig>;
  /** 有効フラグ */
  isActive?: boolean;
}
