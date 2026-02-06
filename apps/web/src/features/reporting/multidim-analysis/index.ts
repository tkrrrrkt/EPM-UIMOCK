/**
 * Multidim Analysis Feature
 * Re-exports for convenient importing
 */

// Components
export { MultidimAnalysisPage } from './components/multidim-analysis-page';
export { FieldPalette } from './components/field-palette';
export { PivotDropZones } from './components/pivot-drop-zones';
export { GlobalFilterBar } from './components/global-filter-bar';
export { PivotResultGrid } from './components/pivot-result-grid';
export { DrillPanel } from './components/drill-panel';
export { PresetSelector } from './components/preset-selector';

// Store
export { usePivotStore, selectLayout, selectGlobalFilters, selectIsLayoutValid } from './store/pivot-store';
export type { PivotState, PivotActions, PivotStore, DropZone, SelectedCell, GlobalFilters } from './store/pivot-store';

// API
export { bffClient } from './api/client';
export type { BffClient } from './api/BffClient';
