export interface ReportLayoutDto {
    id: string;
    meetingTypeId: string;
    layoutCode: string;
    layoutName: string;
    description?: string;
    isDefault: boolean;
    sortOrder: number;
    isActive: boolean;
    pageCount: number;
}
