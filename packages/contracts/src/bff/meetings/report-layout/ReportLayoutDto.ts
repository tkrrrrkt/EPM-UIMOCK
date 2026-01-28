/**
 * レポートレイアウトDTO
 */
export interface ReportLayoutDto {
  /** ID */
  id: string;
  /** 会議種別ID */
  meetingTypeId: string;
  /** レイアウトコード */
  layoutCode: string;
  /** レイアウト名 */
  layoutName: string;
  /** 説明 */
  description?: string;
  /** デフォルトフラグ */
  isDefault: boolean;
  /** 表示順 */
  sortOrder: number;
  /** 有効フラグ */
  isActive: boolean;
  /** 所属ページ数 */
  pageCount: number;
}
