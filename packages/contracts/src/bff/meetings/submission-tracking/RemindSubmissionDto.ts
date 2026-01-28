/**
 * 催促メール送信リクエスト
 */
export interface RemindSubmissionDto {
  /** 催促対象の部門安定ID一覧 */
  departmentStableIds: string[];
  /** カスタムメッセージ（任意） */
  message?: string;
}
