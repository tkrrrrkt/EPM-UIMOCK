/**
 * レイアウトテンプレートDTO
 */
export interface LayoutTemplateDto {
  /** ID */
  id: string;
  /** テンプレートコード */
  templateCode: string;
  /** テンプレート名 */
  templateName: string;
  /** 説明 */
  description: string;
  /** ページ数 */
  pageCount: number;
  /** コンポーネント総数 */
  componentCount: number;
}
