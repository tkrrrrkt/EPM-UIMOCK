import type { ReportComponentType, ReportDataSource, ComponentWidth, ComponentHeight } from '@epm/contracts/shared/enums/meetings';
import type { ComponentConfig } from './ComponentConfig';

/**
 * レポートコンポーネントDTO
 */
export interface ReportComponentDto {
  /** ID */
  id: string;
  /** ページID */
  pageId: string;
  /** コンポーネントコード */
  componentCode: string;
  /** コンポーネント名 */
  componentName: string;
  /** コンポーネントタイプ */
  componentType: ReportComponentType;
  /** データソース */
  dataSource: ReportDataSource;
  /** 幅（FULL/HALF/THIRD） */
  width: ComponentWidth;
  /** 高さ（AUTO/SMALL/MEDIUM/LARGE） */
  height?: ComponentHeight;
  /** 設定JSON（型付き） */
  configJson: ComponentConfig;
  /** 表示順 */
  sortOrder: number;
  /** 有効フラグ */
  isActive: boolean;
}
