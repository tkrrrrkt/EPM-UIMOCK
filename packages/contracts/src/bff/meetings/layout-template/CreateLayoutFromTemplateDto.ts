/**
 * テンプレートからレイアウト作成リクエストDTO
 */
export interface CreateLayoutFromTemplateDto {
  /** 会議種別ID */
  meetingTypeId: string;
  /** テンプレートID */
  templateId: string;
  /** レイアウトコード（必須、英数字アンダースコア、最大50文字） */
  layoutCode: string;
  /** レイアウト名（必須、最大200文字） */
  layoutName: string;
}
