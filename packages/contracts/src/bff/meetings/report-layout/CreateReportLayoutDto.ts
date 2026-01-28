/**
 * レポートレイアウト作成リクエストDTO
 */
export interface CreateReportLayoutDto {
  /** 会議種別ID */
  meetingTypeId: string;
  /** レイアウトコード（必須、英数字アンダースコア、最大50文字） */
  layoutCode: string;
  /** レイアウト名（必須、最大200文字） */
  layoutName: string;
  /** 説明 */
  description?: string;
  /** デフォルトフラグ（デフォルト: false） */
  isDefault?: boolean;
}
