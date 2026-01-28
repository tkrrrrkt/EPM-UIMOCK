import type { SnapshotType } from '../enums/SnapshotType';
export interface CloseEventDto {
    includeSnapshot: boolean;
    snapshotTypes?: SnapshotType[];
    notes?: string;
}
