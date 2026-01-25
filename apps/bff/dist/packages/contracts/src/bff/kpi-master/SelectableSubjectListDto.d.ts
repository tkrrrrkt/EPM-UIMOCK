export interface SelectableSubjectDto {
    id: string;
    subjectCode: string;
    subjectName: string;
    kpiManaged: boolean;
}
export interface SelectableSubjectListDto {
    subjects: SelectableSubjectDto[];
}
