// ============================================
// AG-Grid Shared Components and Utilities
// ============================================

// Re-export from existing config
export {
  registerAgGridModules,
  AG_GRID_LOCALE_JP,
  formatNumber,
  formatVariance,
  formatPercent,
} from "@/features/report/budget-actual-report-ag/components/ag-grid-config"

// Types
export type {
  AmountRowData,
  AmountColumnConfig,
  PendingChange,
  EditableAmountGridProps,
  CellChangeEvent,
  MtpAmountRowData,
  GuidelineAmountRowData,
} from "./types"

// Utilities
export {
  amountValueFormatter,
  amountValueParser,
  createEditableCallback,
  createCellClassRules,
  processCellFromClipboard,
  processCellForClipboard,
  calculatePlanTotal,
  calculateTotalForField,
  mergePendingChanges,
  extractFiscalYearFromField,
  extractPeriodKeyFromField,
} from "./utils"

// Components
export { EditableAmountGrid } from "./editable-amount-grid"
