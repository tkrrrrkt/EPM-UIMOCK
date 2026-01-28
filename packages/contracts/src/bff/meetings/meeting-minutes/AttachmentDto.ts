/**
 * 添付ファイル情報
 */
export interface AttachmentDto {
  /** ファイルID */
  id: string;
  /** ファイル名 */
  fileName: string;
  /** MIMEタイプ */
  mimeType: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** ダウンロードURL */
  url: string;
  /** アップロード日時（ISO 8601） */
  uploadedAt: string;
  /** アップロードユーザー名 */
  uploadedBy: string;
}
