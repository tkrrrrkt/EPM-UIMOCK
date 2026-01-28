/**
 * 選択可能財務科目
 */
export interface SelectableSubjectDto {
  /** 科目ID */
  id: string;
  /** 科目コード */
  subjectCode: string;
  /** 科目名 */
  subjectName: string;
  /** KPI管理対象フラグ */
  kpiManaged: boolean;
}

/**
 * 選択可能財務科目一覧DTO
 */
export interface SelectableSubjectListDto {
  /** 選択可能財務科目一覧（kpi_managed=true） */
  subjects: SelectableSubjectDto[];
}
