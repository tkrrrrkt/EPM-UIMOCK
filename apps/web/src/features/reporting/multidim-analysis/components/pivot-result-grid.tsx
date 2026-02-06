'use client';

/**
 * PivotResultGrid Component
 *
 * Displays pivot query results using AG Grid Enterprise
 * Features:
 * - Hierarchical row/column headers
 * - Number formatting (comma separated)
 * - Loading indicator
 * - Empty state message
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.4)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { BffPivotQueryResponseDto, BffPivotLayoutDto } from '@epm/contracts/bff/multidim-analysis';
import { useShallow } from 'zustand/react/shallow';
import { usePivotStore, type SelectedCell } from '../store/pivot-store';
import { bffClient } from '../api/client';
import { Loader2 } from 'lucide-react';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Number formatter for currency values
const numberFormatter = new Intl.NumberFormat('ja-JP');

export function PivotResultGrid() {
  // Use useShallow to prevent infinite re-renders with object selectors
  const layout = usePivotStore(
    useShallow((s): BffPivotLayoutDto => ({
      mode: s.mode,
      rows: s.rows,
      cols: s.cols,
      values: s.values,
      filters: s.filters,
    }))
  );
  const globalFilters = usePivotStore(useShallow((s) => s.globalFilters));
  const isLayoutValid = usePivotStore((s) => s.values.length > 0 && (s.rows.length > 0 || s.cols.length > 0));
  const { setSelectedCell, setLoading, setError, isLoading, availableFields } = usePivotStore();

  const [data, setData] = useState<BffPivotQueryResponseDto | null>(null);

  // Fetch pivot data when layout or filters change
  const fetchData = useCallback(async () => {
    if (!isLayoutValid) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bffClient.executePivotQuery({
        layout,
        periodFrom: globalFilters.periodFrom,
        periodTo: globalFilters.periodTo,
        scenarioType: globalFilters.scenarioType,
        planEventId: globalFilters.planEventId,
        planVersionId: globalFilters.planVersionId,
        unit: globalFilters.unit,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pivot data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [layout, globalFilters, isLayoutValid, setLoading, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate column definitions from response
  const columnDefs = useMemo((): ColDef[] => {
    if (!data) return [];

    const cols: ColDef[] = [];

    // Row header columns
    layout.rows.forEach((fieldId, index) => {
      const field = availableFields.find((f) => f.id === fieldId);
      cols.push({
        field: `rowHeader${index}`,
        headerName: field?.nameJa || fieldId,
        pinned: 'left',
        width: 150,
        cellClass: 'font-medium',
      });
    });

    // Data columns
    data.colHeaders.forEach((header, index) => {
      cols.push({
        field: `col${index}`,
        headerName: header,
        width: 120,
        type: 'numericColumn',
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return '-';
          return numberFormatter.format(params.value);
        },
        cellClass: 'text-right',
      });
    });

    return cols;
  }, [data, layout.rows, availableFields]);

  // Transform data for AG Grid
  const rowData = useMemo(() => {
    if (!data) return [];

    return data.rowHeaders.map((headers, rowIndex) => {
      const row: Record<string, unknown> = {
        id: rowIndex,
      };

      // Row headers
      headers.forEach((header, headerIndex) => {
        row[`rowHeader${headerIndex}`] = header;
      });

      // Data cells
      data.cells[rowIndex]?.forEach((value, colIndex) => {
        row[`col${colIndex}`] = value;
      });

      return row;
    });
  }, [data]);

  // Handle cell click for drill
  const handleCellClicked = useCallback(
    (event: CellClickedEvent) => {
      if (!data || !event.colDef.field?.startsWith('col')) return;

      const colIndex = parseInt(event.colDef.field.replace('col', ''), 10);
      const rowIndex = event.rowIndex;

      if (rowIndex === null || isNaN(colIndex)) return;

      const rowHeaders = layout.rows.map(
        (_, i) => event.data[`rowHeader${i}`] as string
      );

      const selectedCell: SelectedCell = {
        rowIndex,
        colIndex,
        rowHeaders,
        colHeader: data.colHeaders[colIndex],
        value: data.cells[rowIndex]?.[colIndex] ?? null,
      };

      setSelectedCell(selectedCell);
    },
    [data, layout.rows, setSelectedCell]
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Render states
  if (!isLayoutValid) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">レイアウトを設定してください</p>
          <p className="text-sm mt-1">行または列に1つ以上のフィールドをドロップし、値を設定してください</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">データを取得中...</span>
      </div>
    );
  }

  if (!data || data.cells.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">データがありません</p>
          <p className="text-sm mt-1">条件を変更してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full ag-theme-quartz">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        onGridReady={onGridReady}
        onCellClicked={handleCellClicked}
        defaultColDef={{
          resizable: true,
          sortable: true,
        }}
        animateRows
        suppressRowHoverHighlight={false}
        rowSelection="single"
      />
      {data.meta && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-t">
          <span>
            {data.meta.totalRows.toLocaleString()} 行 | 単位: {data.meta.unit}
          </span>
          <span>実行時間: {data.meta.executionTimeMs}ms</span>
        </div>
      )}
    </div>
  );
}
