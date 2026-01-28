// ============================================
// Re-export from contracts (SSoT)
// ============================================
export {
  // Enums
  RoicPrimaryType,
  RoicGranularity,
  RoicMode,
  RoicLineType,
  RoicTreeSection,
  RoicKpiFormat,
  RoicKpiId,
  RoicAnalysisErrorCode,
  RoicWarningCode,
  // Options
  type BffRoicOptionsRequest,
  type BffRoicFiscalYearOption,
  type BffRoicEventOption,
  type BffRoicVersionOption,
  type BffRoicDepartmentNode,
  type BffRoicOptionsResponse,
  // Data
  type BffRoicDataRequest,
  type BffRoicKpiItem,
  type BffRoicTreeLine,
  type BffRoicChartPoint,
  type BffRoicVsWaccChartData,
  type BffRoicDecompositionBar,
  type BffRoicDecompositionChartData,
  type BffRoicWarning,
  type BffRoicDataResponse,
  // Simple Input
  type BffRoicSimpleInputRequest,
  type BffRoicSimpleInputLine,
  type BffRoicSimpleInputResponse,
  type BffRoicSimpleInputSaveItem,
  type BffRoicSimpleInputSaveRequest,
  type BffRoicSimpleInputSaveResponse,
  // Error
  type BffRoicAnalysisError,
} from '@epm/contracts/bff/roic-analysis';

// ============================================
// UI State Types (Feature-local)
// ============================================

export interface RoicFilterState {
  fiscalYear: number;
  primaryType: 'BUDGET' | 'FORECAST' | 'ACTUAL';
  primaryEventId?: string;
  primaryVersionId?: string;
  compareEnabled: boolean;
  compareFiscalYear?: number;
  compareType?: 'BUDGET' | 'FORECAST' | 'ACTUAL';
  compareEventId?: string;
  compareVersionId?: string;
  periodFrom: number;
  periodTo: number;
  granularity: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  departmentStableId: string;
  includeSubDepartments: boolean;
}

export interface SimulatedValues {
  [lineId: string]: number;
}
