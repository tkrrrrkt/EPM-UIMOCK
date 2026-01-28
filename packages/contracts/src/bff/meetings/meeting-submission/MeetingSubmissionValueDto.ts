/**
 * フォーム項目の入力タイプ
 */
export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'DATE'
  | 'FILE';

/**
 * 部門報告の項目値DTO
 */
export interface MeetingSubmissionValueDto {
  /** ID */
  id: string;
  /** フォーム項目ID */
  fieldId: string;
  /** フォーム項目コード */
  fieldCode: string;
  /** フォーム項目名 */
  fieldName: string;
  /** フォーム項目タイプ */
  fieldType: FormFieldType;
  /** セクションコード */
  sectionCode: string;
  /** セクション名 */
  sectionName: string;
  /** 必須フラグ */
  isRequired: boolean;
  /** テキスト値（TEXT/TEXTAREA/SELECT） */
  valueText?: string;
  /** 数値（NUMBER） */
  valueNumber?: number;
  /** 日付値（DATE、ISO 8601） */
  valueDate?: string;
  /** JSON値（MULTI_SELECT等） */
  valueJson?: unknown;
  /** 引用メタデータ */
  quoteRefsJson?: QuoteRef[];
}

/**
 * 引用メタデータ
 */
export interface QuoteRef {
  /** 引用元タイプ */
  sourceType: 'SUBMISSION' | 'PLAN_VERSION_COMMENT';
  /** 引用元Submission ID */
  sourceSubmissionId?: string;
  /** 引用元Field ID */
  sourceFieldId?: string;
  /** 引用元Plan Version ID */
  sourcePlanVersionId?: string;
  /** 引用元部門 */
  sourceDepartmentStableId?: string;
  /** 引用日時（ISO 8601） */
  quotedAt: string;
}
