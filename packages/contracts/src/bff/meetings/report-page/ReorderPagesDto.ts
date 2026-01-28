/**
 * レポートページ並べ替えリクエストDTO
 */
export interface ReorderPagesDto {
  /** レイアウトID */
  layoutId: string;
  /** 並べ替え後のページID順序 */
  orderedIds: string[];
}
