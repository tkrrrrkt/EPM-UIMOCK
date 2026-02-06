/**
 * API Contracts for 多次元分析（Multidim Analysis）
 * SSoT for BFF/Domain API communication
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md
 *
 * Note: API uses offset/limit for pagination (BFF uses page/pageSize)
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
// Field Definition
// ============================================================

/** フィールドカテゴリ */
export type FieldCategory = 'basic' | 'dimx' | 'option';

/** ドロップゾーン */
export type DropZone = 'rows' | 'cols' | 'filters';

/** フィールド定義 */
export interface ApiFieldDef {
  id: string;
  name: string;
  nameJa: string;
  category: FieldCategory;
  description: string;
  allowedZones: DropZone[];
  isPeriod?: boolean;
}

/** メジャー定義 */
export interface ApiMeasureDef {
  id: string;
  name: string;
  nameJa: string;
  format: 'number' | 'percentage' | 'currency';
}

/** フィールド一覧DTO */
export interface ApiFieldListDto {
  fields: ApiFieldDef[];
  measures: ApiMeasureDef[];
}

// ============================================================
// Pivot Query
// ============================================================

/** ピボットレイアウト */
export interface ApiPivotLayoutDto {
  mode: AnalysisMode;
  rows: string[];
  cols: string[];
  values: string[];
  filters: Record<string, string | string[] | null>;
}

/** ピボットクエリリクエスト */
export interface ApiPivotQueryRequestDto {
  layout: ApiPivotLayoutDto;
  periodFrom: string;
  periodTo: string;
  scenarioType: ScenarioType;
  planEventId?: string;
  planVersionId?: string;
  unit: UnitType;
}

/** ピボットクエリメタ情報 */
export interface ApiPivotQueryMeta {
  unit: UnitType;
  appliedTopN: number | null;
  warnings: string[];
  totalRows: number;
  executionTimeMs: number;
}

/** ピボットクエリレスポンス */
export interface ApiPivotQueryResponseDto {
  rowHeaders: string[][];
  colHeaders: string[];
  cells: (number | null)[][];
  meta: ApiPivotQueryMeta;
}

// ============================================================
// Drilldown
// ============================================================

/** ドリル条件 */
export interface ApiDrillConditionsDto {
  period?: string;
  org?: string;
  account?: string;
  dimX?: string;
  project?: string;
}

/** ドリルダウンリクエスト */
export interface ApiDrilldownRequestDto {
  conditions: ApiDrillConditionsDto;
  drillDimension: string;
  topN: number;
}

/** ドリルダウン項目 */
export interface ApiDrilldownItemDto {
  label: string;
  value: number;
  percentage: number;
}

/** ドリルダウンレスポンス */
export interface ApiDrilldownResponseDto {
  items: ApiDrilldownItemDto[];
  total: number;
}

// ============================================================
// Drillthrough (offset/limit pagination)
// ============================================================

/** ドリルスルーリクエスト（offset/limit使用） */
export interface ApiDrillthroughRequestDto {
  conditions: ApiDrillConditionsDto;
  offset: number;
  limit: number;
}

/** ドリルスルー項目 */
export interface ApiDrillthroughItemDto {
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
export interface ApiDrillthroughResponseDto {
  items: ApiDrillthroughItemDto[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================================
// Presets
// ============================================================

/** レイアウトプリセット */
export interface ApiLayoutPresetDto {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  layout: Partial<ApiPivotLayoutDto>;
}

/** プリセット一覧DTO */
export interface ApiPresetListDto {
  presets: ApiLayoutPresetDto[];
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
