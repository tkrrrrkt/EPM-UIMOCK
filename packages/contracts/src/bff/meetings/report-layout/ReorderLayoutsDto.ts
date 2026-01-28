/**
 * レポートレイアウト並べ替えリクエストDTO
 */
export interface ReorderLayoutsDto {
  /** 会議種別ID */
  meetingTypeId: string;
  /** 並べ替え後のレイアウトID順序 */
  orderedIds: string[];
}
