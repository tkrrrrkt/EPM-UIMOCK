import type { SnapshotType } from '../enums/SnapshotType';

/**
 * 会議クローズリクエスト
 */
export interface CloseEventDto {
  /** スナップショットを取得するか */
  includeSnapshot: boolean;
  /** 取得するスナップショット種別一覧 */
  snapshotTypes?: SnapshotType[];
  /** クローズ備考（任意） */
  notes?: string;
}
