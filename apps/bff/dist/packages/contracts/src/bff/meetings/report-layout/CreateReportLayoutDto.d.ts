export interface CreateReportLayoutDto {
    meetingTypeId: string;
    layoutCode: string;
    layoutName: string;
    description?: string;
    isDefault?: boolean;
}
