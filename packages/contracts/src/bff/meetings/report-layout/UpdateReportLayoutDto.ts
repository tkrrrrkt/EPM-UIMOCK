/**
 * レポートレイアウト更新リクエストDTO
 */
export interface UpdateReportLayoutDto {
  /** レイアウトコード */
  layoutCode?: string;
  /** レイアウト名 */
  layoutName?: string;
  /** 説明 */
  description?: string;
  /** デフォルトフラグ */
  isDefault?: boolean;
  /** 有効フラグ */
  isActive?: boolean;
}
