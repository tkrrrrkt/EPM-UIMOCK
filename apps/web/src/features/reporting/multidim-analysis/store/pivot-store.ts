/**
 * Pivot Store - Zustand State Management for Multidim Analysis
 *
 * Purpose:
 * - Manage pivot layout state (rows, cols, values, filters)
 * - Handle global filter state (period, scenario, unit)
 * - Implement DimX mutual exclusion rules
 * - Persist layout to localStorage
 * - URL sharing (Base64 encode/decode)
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 15.1-15.3)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AnalysisMode,
  UnitType,
  ScenarioType,
  type BffPivotLayoutDto,
  type BffFieldDef,
} from '@epm/contracts/bff/multidim-analysis';

// ============================================================
// Types
// ============================================================

export type DropZone = 'rows' | 'cols' | 'values' | 'filters';

export interface SelectedCell {
  rowIndex: number;
  colIndex: number;
  rowHeaders: string[];
  colHeader: string;
  value: number | null;
}

export interface GlobalFilters {
  periodFrom: string;
  periodTo: string;
  scenarioType: ScenarioType;
  planEventId?: string;
  planVersionId?: string;
  unit: UnitType;
}

export interface PivotState {
  // Layout
  mode: AnalysisMode;
  rows: string[];
  cols: string[];
  values: string[];
  filters: Record<string, string | string[] | null>;

  // Global Filters
  globalFilters: GlobalFilters;

  // UI State
  selectedCell: SelectedCell | null;
  isLoading: boolean;
  error: string | null;

  // Field metadata (loaded from API)
  availableFields: BffFieldDef[];
}

export interface PivotActions {
  // Layout Actions
  setMode: (mode: AnalysisMode) => void;
  addFieldToZone: (fieldId: string, zone: DropZone, index?: number) => boolean;
  removeFieldFromZone: (fieldId: string, zone: DropZone) => void;
  reorderFieldsInZone: (zone: DropZone, fromIndex: number, toIndex: number) => void;
  setFilterValue: (fieldId: string, value: string | string[] | null) => void;

  // Global Filter Actions
  setGlobalFilters: (filters: Partial<GlobalFilters>) => void;

  // UI Actions
  setSelectedCell: (cell: SelectedCell | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAvailableFields: (fields: BffFieldDef[]) => void;

  // URL Sharing
  getLayoutForUrl: () => string;
  loadLayoutFromUrl: (encoded: string) => boolean;

  // Reset
  resetLayout: () => void;
  applyPreset: (layout: Partial<BffPivotLayoutDto>) => void;
}

export type PivotStore = PivotState & PivotActions;

// ============================================================
// Constants
// ============================================================

const MAX_ROW_FIELDS = 2;
const DIMX_FIELD_PREFIX = 'dim';

// Default values
const getDefaultGlobalFilters = (): GlobalFilters => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return {
    periodFrom: `${currentYear}/${String(currentMonth).padStart(2, '0')}`,
    periodTo: `${currentYear}/${String(currentMonth).padStart(2, '0')}`,
    scenarioType: ScenarioType.ACTUAL,
    unit: UnitType.THOUSAND,
  };
};

const getDefaultState = (): PivotState => ({
  mode: AnalysisMode.STANDARD,
  rows: [],
  cols: [],
  values: ['amount'],
  filters: {},
  globalFilters: getDefaultGlobalFilters(),
  selectedCell: null,
  isLoading: false,
  error: null,
  availableFields: [],
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if a field is a DimX field
 */
function isDimXField(fieldId: string): boolean {
  return fieldId.startsWith(DIMX_FIELD_PREFIX);
}

/**
 * Get currently used DimX fields across all zones
 */
function getUsedDimXFields(state: PivotState): string[] {
  const allFields = [...state.rows, ...state.cols, ...Object.keys(state.filters)];
  return allFields.filter(isDimXField);
}

/**
 * Check if adding a field would violate DimX mutual exclusion rule
 * Rule: Only one DimX field can be used at a time across all zones
 */
function wouldViolateDimXRule(
  state: PivotState,
  fieldId: string,
  targetZone: DropZone
): boolean {
  if (!isDimXField(fieldId)) return false;

  const usedDimX = getUsedDimXFields(state);

  // If the field is already in use, allow moving it
  if (usedDimX.includes(fieldId)) return false;

  // If another DimX is already in use, violation
  return usedDimX.length > 0;
}

/**
 * Check if field is valid for the current mode
 */
function isFieldValidForMode(fieldId: string, mode: AnalysisMode): boolean {
  // Project field only available in PROJECT mode
  if (fieldId === 'project') {
    return mode === AnalysisMode.PROJECT;
  }

  // DimX fields not available in PROJECT mode
  if (isDimXField(fieldId) && mode === AnalysisMode.PROJECT) {
    return false;
  }

  return true;
}

/**
 * Remove invalid fields when mode changes
 */
function filterFieldsForMode(fields: string[], mode: AnalysisMode): string[] {
  return fields.filter((f) => isFieldValidForMode(f, mode));
}

/**
 * Encode layout to Base64 for URL sharing
 */
function encodeLayout(state: PivotState): string {
  const layout: BffPivotLayoutDto = {
    mode: state.mode,
    rows: state.rows,
    cols: state.cols,
    values: state.values,
    filters: state.filters,
  };
  try {
    const json = JSON.stringify(layout);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

/**
 * Decode layout from Base64 URL parameter
 */
function decodeLayout(encoded: string): BffPivotLayoutDto | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);

    // Validate structure
    if (
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.rows) ||
      !Array.isArray(parsed.cols) ||
      !Array.isArray(parsed.values)
    ) {
      return null;
    }

    return parsed as BffPivotLayoutDto;
  } catch {
    return null;
  }
}

// ============================================================
// Store Definition
// ============================================================

export const usePivotStore = create<PivotStore>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      // --------------------------------------------------------
      // Layout Actions
      // --------------------------------------------------------

      setMode: (mode) => {
        set((state) => ({
          mode,
          rows: filterFieldsForMode(state.rows, mode),
          cols: filterFieldsForMode(state.cols, mode),
          filters: Object.fromEntries(
            Object.entries(state.filters).filter(([key]) =>
              isFieldValidForMode(key, mode)
            )
          ),
        }));
      },

      addFieldToZone: (fieldId, zone, index) => {
        const state = get();

        // Check mode validity
        if (!isFieldValidForMode(fieldId, state.mode)) {
          set({ error: `Field "${fieldId}" is not available in ${state.mode} mode` });
          return false;
        }

        // Check DimX rule (for rows, cols, filters)
        if (zone !== 'values' && wouldViolateDimXRule(state, fieldId, zone)) {
          set({ error: 'Only one dimension (DimX) field can be used at a time' });
          return false;
        }

        // Check row limit
        if (zone === 'rows' && state.rows.length >= MAX_ROW_FIELDS && !state.rows.includes(fieldId)) {
          set({ error: `Maximum ${MAX_ROW_FIELDS} fields allowed in row zone` });
          return false;
        }

        // Remove from other zones first (except values - values can have same field)
        const removeFromOtherZones = () => {
          const newRows = state.rows.filter((f) => f !== fieldId);
          const newCols = state.cols.filter((f) => f !== fieldId);
          const newFilters = { ...state.filters };
          delete newFilters[fieldId];
          return { newRows, newCols, newFilters };
        };

        const { newRows, newCols, newFilters } = removeFromOtherZones();

        set((prev) => {
          switch (zone) {
            case 'rows': {
              const updated = [...newRows];
              if (!updated.includes(fieldId)) {
                if (index !== undefined) {
                  updated.splice(index, 0, fieldId);
                } else {
                  updated.push(fieldId);
                }
              }
              return { rows: updated, cols: newCols, filters: newFilters, error: null };
            }
            case 'cols': {
              const updated = [...newCols];
              if (!updated.includes(fieldId)) {
                if (index !== undefined) {
                  updated.splice(index, 0, fieldId);
                } else {
                  updated.push(fieldId);
                }
              }
              return { rows: newRows, cols: updated, filters: newFilters, error: null };
            }
            case 'values': {
              const updated = [...prev.values];
              if (!updated.includes(fieldId)) {
                updated.push(fieldId);
              }
              return { values: updated, error: null };
            }
            case 'filters': {
              return {
                rows: newRows,
                cols: newCols,
                filters: { ...newFilters, [fieldId]: null },
                error: null,
              };
            }
            default:
              return {};
          }
        });

        return true;
      },

      removeFieldFromZone: (fieldId, zone) => {
        set((state) => {
          switch (zone) {
            case 'rows':
              return { rows: state.rows.filter((f) => f !== fieldId) };
            case 'cols':
              return { cols: state.cols.filter((f) => f !== fieldId) };
            case 'values':
              return { values: state.values.filter((f) => f !== fieldId) };
            case 'filters': {
              const newFilters = { ...state.filters };
              delete newFilters[fieldId];
              return { filters: newFilters };
            }
            default:
              return {};
          }
        });
      },

      reorderFieldsInZone: (zone, fromIndex, toIndex) => {
        set((state) => {
          const getFieldArray = () => {
            switch (zone) {
              case 'rows':
                return [...state.rows];
              case 'cols':
                return [...state.cols];
              case 'values':
                return [...state.values];
              default:
                return [];
            }
          };

          const fields = getFieldArray();
          const [removed] = fields.splice(fromIndex, 1);
          fields.splice(toIndex, 0, removed);

          switch (zone) {
            case 'rows':
              return { rows: fields };
            case 'cols':
              return { cols: fields };
            case 'values':
              return { values: fields };
            default:
              return {};
          }
        });
      },

      setFilterValue: (fieldId, value) => {
        set((state) => ({
          filters: { ...state.filters, [fieldId]: value },
        }));
      },

      // --------------------------------------------------------
      // Global Filter Actions
      // --------------------------------------------------------

      setGlobalFilters: (filters) => {
        set((state) => ({
          globalFilters: { ...state.globalFilters, ...filters },
        }));
      },

      // --------------------------------------------------------
      // UI Actions
      // --------------------------------------------------------

      setSelectedCell: (cell) => set({ selectedCell: cell }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setAvailableFields: (fields) => set({ availableFields: fields }),

      // --------------------------------------------------------
      // URL Sharing
      // --------------------------------------------------------

      getLayoutForUrl: () => {
        return encodeLayout(get());
      },

      loadLayoutFromUrl: (encoded) => {
        const layout = decodeLayout(encoded);
        if (!layout) {
          set({ error: 'Invalid layout URL' });
          return false;
        }

        set({
          mode: layout.mode || AnalysisMode.STANDARD,
          rows: layout.rows || [],
          cols: layout.cols || [],
          values: layout.values || ['amount'],
          filters: layout.filters || {},
          error: null,
        });
        return true;
      },

      // --------------------------------------------------------
      // Reset & Preset
      // --------------------------------------------------------

      resetLayout: () => {
        set(getDefaultState());
      },

      applyPreset: (layout) => {
        set((state) => ({
          mode: layout.mode || state.mode,
          rows: layout.rows || state.rows,
          cols: layout.cols || state.cols,
          values: layout.values || state.values,
          filters: layout.filters || state.filters,
          error: null,
        }));
      },
    }),
    {
      name: 'epm-multidim-pivot-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        rows: state.rows,
        cols: state.cols,
        values: state.values,
        filters: state.filters,
        globalFilters: state.globalFilters,
      }),
    }
  )
);

// ============================================================
// Selectors
// ============================================================

export const selectLayout = (state: PivotStore): BffPivotLayoutDto => ({
  mode: state.mode,
  rows: state.rows,
  cols: state.cols,
  values: state.values,
  filters: state.filters,
});

export const selectGlobalFilters = (state: PivotStore): GlobalFilters =>
  state.globalFilters;

export const selectIsLayoutValid = (state: PivotStore): boolean => {
  return state.values.length > 0 && (state.rows.length > 0 || state.cols.length > 0);
};
