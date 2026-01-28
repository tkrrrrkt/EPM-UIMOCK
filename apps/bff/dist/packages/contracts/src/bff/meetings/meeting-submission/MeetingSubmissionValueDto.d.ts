export type FormFieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'DATE' | 'FILE';
export interface MeetingSubmissionValueDto {
    id: string;
    fieldId: string;
    fieldCode: string;
    fieldName: string;
    fieldType: FormFieldType;
    sectionCode: string;
    sectionName: string;
    isRequired: boolean;
    valueText?: string;
    valueNumber?: number;
    valueDate?: string;
    valueJson?: unknown;
    quoteRefsJson?: QuoteRef[];
}
export interface QuoteRef {
    sourceType: 'SUBMISSION' | 'PLAN_VERSION_COMMENT';
    sourceSubmissionId?: string;
    sourceFieldId?: string;
    sourcePlanVersionId?: string;
    sourceDepartmentStableId?: string;
    quotedAt: string;
}
