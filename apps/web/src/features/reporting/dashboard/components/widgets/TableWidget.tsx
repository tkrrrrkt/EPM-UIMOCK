/**
 * Table Widget
 *
 * Purpose:
 * - Display data in tabular format
 * - Support sorting
 * - Show comparison columns
 * - Excel export support
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 11)
 */
'use client';

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Sort,
  Toolbar,
  ExcelExport,
  Page,
} from '@syncfusion/ej2-react-grids';
import type { BffWidgetDto, BffWidgetDataResponseDto, TableDisplayConfig } from '@epm/contracts/bff/dashboard';

interface TableWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Table Widget Component
 * Displays data in table format with SyncFusion DataGrid
 */
export function TableWidget({ widget, data }: TableWidgetProps) {
  const displayConfig = widget.displayConfig as TableDisplayConfig;

  // Prepare table data
  const tableData = data.dataPoints.map((dp, idx) => ({
    id: idx,
    label: dp.label,
    value: dp.value,
    compareValue: dp.compareValue ?? null,
    difference: dp.value !== null && dp.compareValue !== null && dp.compareValue !== undefined
      ? dp.value - dp.compareValue
      : null,
  }));

  // Format number with commas
  const formatNumber = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  };

  // Number template for formatting
  const numberTemplate = (props: any) => {
    return <span>{formatNumber(props.value)}</span>;
  };

  const compareValueTemplate = (props: any) => {
    return <span>{formatNumber(props.compareValue)}</span>;
  };

  const differenceTemplate = (props: any) => {
    const diff = props.difference;
    if (diff === null) return <span>-</span>;
    const color = diff >= 0 ? 'text-success-600' : 'text-error-600';
    return <span className={color}>{formatNumber(diff)}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <GridComponent
        dataSource={tableData}
        allowSorting={true}
        allowPaging={false}
        height="100%"
        gridLines="Both"
      >
        <ColumnsDirective>
          <ColumnDirective
            field="label"
            headerText="期間"
            width="120"
            textAlign="Left"
          />
          <ColumnDirective
            field="value"
            headerText={`値${data.unit ? ` (${data.unit})` : ''}`}
            width="120"
            textAlign="Right"
            template={numberTemplate}
          />
          {displayConfig.showCompareColumns && (
            <>
              <ColumnDirective
                field="compareValue"
                headerText={`比較値${data.unit ? ` (${data.unit})` : ''}`}
                width="120"
                textAlign="Right"
                template={compareValueTemplate}
              />
              <ColumnDirective
                field="difference"
                headerText={`差異${data.unit ? ` (${data.unit})` : ''}`}
                width="120"
                textAlign="Right"
                template={differenceTemplate}
              />
            </>
          )}
        </ColumnsDirective>
        <Inject services={[Sort, Toolbar, ExcelExport, Page]} />
      </GridComponent>
    </div>
  );
}
