// ============================================
// Enums
// ============================================

export const CvpPrimaryType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type CvpPrimaryType = (typeof CvpPrimaryType)[keyof typeof CvpPrimaryType];

export const CvpGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
} as const;
export type CvpGranularity = (typeof CvpGranularity)[keyof typeof CvpGranularity];

export const CvpLineType = {
  HEADER: 'header',
  ACCOUNT: 'account',
  NOTE: 'note',
  BLANK: 'blank',
  ADJUSTMENT: 'adjustment',
} as const;
export type CvpLineType = (typeof CvpLineType)[keyof typeof CvpLineType];

// ============================================
// Options Request/Response
// ============================================

export interface BffCvpOptionsRequest {
  companyId: string;
}

export interface BffCvpFiscalYearOption {
  fiscalYear: number;
  label: string;
}

export interface BffCvpEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: CvpPrimaryType;
  fiscalYear: number;
  hasFixedVersion: boolean;
}

export interface BffCvpVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  versionNo: number;
  status: 'DRAFT' | 'FIXED';
}

export interface BffCvpDepartmentNode {
  id: string;
  stableId: string;
  name: string;
  code: string;
  level: number;
  hasChildren: boolean;
  children?: BffCvpDepartmentNode[];
}

export interface BffCvpOptionsResponse {
  fiscalYears: BffCvpFiscalYearOption[];
  budgetEvents: BffCvpEventOption[];
  forecastEvents: BffCvpEventOption[];
  versions: Record<string, BffCvpVersionOption[]>;
  departments: BffCvpDepartmentNode[];
  cvpLayoutId: string | null;
  cvpLayoutName: string | null;
}

// ============================================
// Data Request/Response
// ============================================

export interface BffCvpDataRequest {
  companyId: string;
  fiscalYear: number;
  primaryType: CvpPrimaryType;
  primaryEventId?: string;
  primaryVersionId?: string;
  compareEnabled: boolean;
  compareFiscalYear?: number;
  compareType?: CvpPrimaryType;
  compareEventId?: string;
  compareVersionId?: string;
  periodFrom: number;
  periodTo: number;
  granularity: CvpGranularity;
  departmentStableId: string;
  includeSubDepartments: boolean;
}

// KPI
export interface BffCvpKpiItem {
  id: string;
  name: string;
  originalValue: number | null;
  simulatedValue: number | null;
  compareValue: number | null;
  unit: string;
  isCalculable: boolean;
  format: 'currency' | 'percent';
}

// CVP Tree
export interface BffCvpTreeLine {
  lineId: string;
  lineNo: number;
  lineType: CvpLineType;
  displayName: string;
  subjectId: string | null;
  indentLevel: number;
  isEditable: boolean;
  isAdjustment: boolean;
  originalValue: number | null;
  compareValue: number | null;
  parentLineId: string | null;
  childLineIds: string[];
  rollupCoefficient: number;
}

// Charts
export interface BffCvpBreakevenChartPoint {
  x: number;
  y: number;
}

export interface BffCvpBreakevenChartData {
  maxSales: number;
  salesLine: BffCvpBreakevenChartPoint[];
  totalCostLine: BffCvpBreakevenChartPoint[];
  fixedCostLine: BffCvpBreakevenChartPoint[];
  breakevenPoint: BffCvpBreakevenChartPoint | null;
  isCalculable: boolean;
}

export interface BffCvpWaterfallItem {
  id: string;
  name: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'subtotal' | 'end';
}

export interface BffCvpWaterfallData {
  items: BffCvpWaterfallItem[];
}

// Main Response
export interface BffCvpDataResponse {
  kpis: BffCvpKpiItem[];
  tree: BffCvpTreeLine[];
  breakevenChart: BffCvpBreakevenChartData;
  waterfallOriginal: BffCvpWaterfallData;
  waterfallCompare: BffCvpWaterfallData | null;
  layoutId: string;
  layoutName: string;
}

// ============================================
// Error Codes
// ============================================

export const CvpAnalysisErrorCode = {
  CVP_LAYOUT_NOT_SET: 'CVP_LAYOUT_NOT_SET',
  PRIMARY_NOT_SELECTED: 'PRIMARY_NOT_SELECTED',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  PERIOD_INVALID: 'PERIOD_INVALID',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type CvpAnalysisErrorCode = (typeof CvpAnalysisErrorCode)[keyof typeof CvpAnalysisErrorCode];

export interface BffCvpAnalysisError {
  code: CvpAnalysisErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// UI State Types
// ============================================

export interface CvpFilterState {
  fiscalYear: number | null;
  primaryType: CvpPrimaryType | null;
  primaryEventId: string | null;
  primaryVersionId: string | null;
  compareEnabled: boolean;
  compareFiscalYear: number | null;
  compareType: CvpPrimaryType | null;
  compareEventId: string | null;
  compareVersionId: string | null;
  periodFrom: number;
  periodTo: number;
  granularity: CvpGranularity;
  departmentStableId: string | null;
  includeSubDepartments: boolean;
}

export interface SimulatedTreeLine extends BffCvpTreeLine {
  simulatedValue: number | null;
  hasChanged: boolean;
}
