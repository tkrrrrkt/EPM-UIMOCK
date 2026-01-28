import type { AttachmentDto } from './AttachmentDto';

/**
 * 議事録データ
 */
export interface MeetingMinutesDto {
  /** 議事録ID */
  id: string;
  /** 会議イベントID */
  eventId: string;
  /** 議事録本文（HTML/リッチテキスト） */
  content: string;
  /** 決定事項一覧 */
  decisions: string[];
  /** 出席者一覧 */
  attendees: string[];
  /** 添付ファイル一覧 */
  attachments: AttachmentDto[];
  /** 作成日時（ISO 8601） */
  createdAt: string;
  /** 更新日時（ISO 8601） */
  updatedAt: string;
  /** 作成者名 */
  createdBy: string;
  /** 更新者名 */
  updatedBy: string;
}
