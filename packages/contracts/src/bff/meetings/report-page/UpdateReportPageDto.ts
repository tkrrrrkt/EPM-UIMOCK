import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';

/**
 * レポートページ更新リクエストDTO
 */
export interface UpdateReportPageDto {
  /** ページコード */
  pageCode?: string;
  /** ページ名 */
  pageName?: string;
  /** ページタイプ */
  pageType?: ReportPageType;
  /** 展開軸ID（null指定で解除） */
  expandDimensionId?: string | null;
  /** 有効フラグ */
  isActive?: boolean;
}
