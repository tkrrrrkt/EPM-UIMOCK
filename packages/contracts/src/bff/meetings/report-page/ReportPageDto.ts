import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';

/**
 * レポートページDTO
 */
export interface ReportPageDto {
  /** ID */
  id: string;
  /** レイアウトID */
  layoutId: string;
  /** ページコード */
  pageCode: string;
  /** ページ名 */
  pageName: string;
  /** ページタイプ（FIXED/PER_DEPARTMENT/PER_BU） */
  pageType: ReportPageType;
  /** 展開軸ID（PER_DEPARTMENT/PER_BU時に使用） */
  expandDimensionId?: string;
  /** 表示順 */
  sortOrder: number;
  /** 有効フラグ */
  isActive: boolean;
  /** 所属コンポーネント数 */
  componentCount: number;
}
