import type { LayoutTemplateDto } from './LayoutTemplateDto';

/**
 * レイアウトテンプレート一覧DTO
 */
export interface LayoutTemplateListDto {
  /** テンプレート一覧 */
  items: LayoutTemplateDto[];
  /** 総件数 */
  total: number;
}
