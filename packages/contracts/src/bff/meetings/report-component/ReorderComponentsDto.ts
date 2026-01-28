/**
 * レポートコンポーネント並べ替えリクエストDTO
 */
export interface ReorderComponentsDto {
  /** ページID */
  pageId: string;
  /** 並べ替え後のコンポーネントID順序 */
  orderedIds: string[];
}
