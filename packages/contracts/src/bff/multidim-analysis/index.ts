/**
 * BFF Contracts for 多次元分析（Multidim Analysis）
 * SSoT for UI/BFF communication
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md
 */

import {
  AnalysisMode,
  UnitType,
  ScenarioType,
} from '../../shared/enums/multidim-analysis';
import { MultidimErrorCode } from '../../shared/errors/multidim-analysis';

// Re-export enums and errors for convenience
export { AnalysisMode, UnitType, ScenarioType, MultidimErrorCode };

// ============================================================
// Field Definition (Task 2.1)
// ============================================================

/** フィールドカテゴリ */
export type FieldCategory = 'basic' | 'dimx' | 'option';

/** ドロップゾーン */
export type DropZone = 'rows' | 'cols' | 'filters';

/** フィールド定義 */
export interface BffFieldDef {
  id: string;
  name: string;
  nameJa: string;
  category: FieldCategory;
  description: string;
  allowedZones: DropZone[];
  isPeriod?: boolean;
}

/** メジャー定義 */
export interface BffMeasureDef {
  id: string;
  name: string;
  nameJa: string;
  format: 'number' | 'percentage' | 'currency';
}

/** フィールド一覧DTO */
export interface BffFieldListDto {
  fields: BffFieldDef[];
  measures: BffMeasureDef[];
}

// ============================================================
// Pivot Query (Task 2.2)
// ============================================================

/** ピボットレイアウト */
export interface BffPivotLayoutDto {
  mode: AnalysisMode;
  rows: string[];
  cols: string[];
  values: string[];
  filters: Record<string, string | string[] | null>;
}

/** ピボットクエリリクエスト */
export interface BffPivotQueryRequestDto {
  layout: BffPivotLayoutDto;
  periodFrom: string;
  periodTo: string;
  scenarioType: ScenarioType;
  planEventId?: string;
  planVersionId?: string;
  unit: UnitType;
}

/** ピボットクエリメタ情報 */
export interface BffPivotQueryMeta {
  unit: UnitType;
  appliedTopN: number | null;
  warnings: string[];
  totalRows: number;
  executionTimeMs: number;
}

/** ピボットクエリレスポンス */
export interface BffPivotQueryResponseDto {
  rowHeaders: string[][];
  colHeaders: string[];
  cells: (number | null)[][];
  meta: BffPivotQueryMeta;
}

// ============================================================
// Drilldown (Task 2.3)
// ============================================================

/** ドリル条件 */
export interface BffDrillConditionsDto {
  period?: string;
  org?: string;
  account?: string;
  dimX?: string;
  project?: string;
}

/** ドリルダウンリクエスト */
export interface BffDrilldownRequestDto {
  conditions: BffDrillConditionsDto;
  drillDimension: string;
  topN: number;
}

/** ドリルダウン項目 */
export interface BffDrilldownItemDto {
  label: string;
  value: number;
  percentage: number;
}

/** ドリルダウンレスポンス */
export interface BffDrilldownResponseDto {
  items: BffDrilldownItemDto[];
  total: number;
}

// ============================================================
// Drillthrough (Task 2.4)
// ============================================================

/** ドリルスルーリクエスト */
export interface BffDrillthroughRequestDto {
  conditions: BffDrillConditionsDto;
  page: number;
  pageSize: number;
}

/** ドリルスルー項目 */
export interface BffDrillthroughItemDto {
  id: string;
  date: string;
  org: string;
  account: string;
  description: string;
  amount: number;
  dimX?: string;
  project?: string;
}

/** ドリルスルーレスポンス */
export interface BffDrillthroughResponseDto {
  items: BffDrillthroughItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// Presets (Task 2.5)
// ============================================================

/** レイアウトプリセット */
export interface BffLayoutPresetDto {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  layout: Partial<BffPivotLayoutDto>;
}

/** プリセット一覧DTO */
export interface BffPresetListDto {
  presets: BffLayoutPresetDto[];
}

// ============================================================
// Error Response
// ============================================================

/** 多次元分析エラーレスポンス */
export interface MultidimError {
  code: MultidimErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
