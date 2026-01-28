import type { ReportPageType } from '@epm/contracts/shared/enums/meetings';

/**
 * レポートページ作成リクエストDTO
 */
export interface CreateReportPageDto {
  /** レイアウトID */
  layoutId: string;
  /** ページコード（必須、英数字アンダースコア、最大50文字） */
  pageCode: string;
  /** ページ名（必須、最大200文字） */
  pageName: string;
  /** ページタイプ（FIXED/PER_DEPARTMENT/PER_BU） */
  pageType: ReportPageType;
  /** 展開軸ID（PER_DEPARTMENT/PER_BU時に使用） */
  expandDimensionId?: string;
}
