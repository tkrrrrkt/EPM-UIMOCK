/**
 * 議事録保存リクエスト
 */
export interface SaveMeetingMinutesDto {
  /** 議事録本文（HTML/リッチテキスト） */
  content: string;
  /** 決定事項一覧 */
  decisions: string[];
  /** 出席者一覧 */
  attendees: string[];
  // Note: 添付ファイルは別途ファイルアップロードAPIで処理
}
