/**
 * Table Widget
 *
 * Purpose:
 * - Display data in tabular format with modern SyncFusion Grid
 * - High visual appeal with colors, gradients, and styling
 * - Support sorting, filtering, search, pagination
 * - Show comparison columns with conditional styling
 * - Excel export support
 * - Responsive column resizing
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 11)
 */
'use client';

import { useRef, useEffect } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Sort,
  Toolbar,
  ExcelExport,
  Page,
  Filter,
  Selection,
  Resize,
  Reorder,
} from '@syncfusion/ej2-react-grids';
import type { BffWidgetDto, BffWidgetDataResponseDto, TableDisplayConfig } from '@epm/contracts/bff/dashboard';

interface TableWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Table Widget Component
 * Displays data in table format with modern SyncFusion Grid (Enterprise version)
 */
export function TableWidget({ widget, data }: TableWidgetProps) {
  const gridRef = useRef<any>(null);
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
    differenceRate: dp.compareValue && dp.compareValue !== 0 && dp.value !== null
      ? ((dp.value - dp.compareValue) / dp.compareValue * 100)
      : null,
  }));

  // Format number with commas
  const formatNumber = (value: number | null) => {
    if (value === null) return '-';
    return value.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '-';
    return value.toFixed(1) + '%';
  };

  // Number template for formatting
  const numberTemplate = (props: any) => {
    return <span className="font-semibold text-neutral-900">{formatNumber(props.value)}</span>;
  };

  const compareValueTemplate = (props: any) => {
    return <span className="font-semibold text-neutral-700">{formatNumber(props.compareValue)}</span>;
  };

  const differenceTemplate = (props: any) => {
    const diff = props.difference;
    if (diff === null) return <span className="text-neutral-400">-</span>;

    const isPositive = diff >= 0;
    const color = isPositive ? 'text-success-700' : 'text-error-700';
    const bgColor = isPositive ? 'bg-success-100' : 'bg-error-100';
    const icon = isPositive ? '📈' : '📉';

    return (
      <span className={`${color} font-bold flex items-center gap-2 px-2 py-1 rounded-md ${bgColor}`}>
        <span>{icon}</span>
        <span>{formatNumber(diff)}</span>
      </span>
    );
  };

  const differenceRateTemplate = (props: any) => {
    const rate = props.differenceRate;
    if (rate === null) return <span className="text-neutral-400">-</span>;

    const isPositive = rate >= 0;
    const color = isPositive ? 'text-success-700' : 'text-error-700';
    const bgColor = isPositive ? 'bg-success-100' : 'bg-error-100';
    const icon = isPositive ? '↗' : '↘';
    const isMajor = Math.abs(rate) > 10;
    const ringColor = isPositive ? 'ring-success-300' : 'ring-error-300';

    return (
      <span
        className={`${color} font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor} ${
          isMajor ? `ring-2 ring-offset-1 ${ringColor}` : ''
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span>{formatPercent(rate)}</span>
      </span>
    );
  };

  // Handle row data bound to add alternating colors
  const onRowDataBound = (args: any) => {
    if (!args.data) return;

    const row = args.rowElement as HTMLElement;
    if (!row) return;

    // ストライプ効果（偶数行と奇数行で背景色を変更）
    if (args.rowIndex % 2 === 0) {
      row.style.backgroundColor = '#f9fafb';
    } else {
      row.style.backgroundColor = '#ffffff';
    }

    // ホバー効果
    row.style.transition = 'all 0.2s ease-in-out';

    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = '#eff6ff';
      row.style.boxShadow = 'inset 0 1px 3px rgba(59, 130, 246, 0.1)';
    });

    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = args.rowIndex % 2 === 0 ? '#f9fafb' : '#ffffff';
      row.style.boxShadow = 'none';
    });

    // 差異が大きい行を強調
    if (args.data.difference !== null && Math.abs(args.data.difference) > 1000) {
      row.style.borderLeft = '4px solid #3b82f6';
    }
  };

  useEffect(() => {
    // グリッドのスタイルをカスタマイズ
    if (gridRef.current) {
      const gridElement = gridRef.current.element;
      if (gridElement) {
        // ヘッダーをスタイリング
        const headerRow = gridElement.querySelector('.e-headercell');
        if (headerRow) {
          // CSSクラスを追加することで、グローバルなスタイリングを適用
        }
      }
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200">
      {/* カスタムスタイル */}
      <style>{`
        /* ヘッダーのスタイリング - デザインシステムのプライマリーカラーを使用 */
        .modern-grid .e-headercell {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%) !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          padding: 12px 8px !important;
          border-bottom: 3px solid var(--primary-900) !important;
        }

        .modern-grid .e-headercell::before {
          display: none;
        }

        .modern-grid .e-headerrow {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%) !important;
        }

        /* 行のスタイリング */
        .modern-grid .e-row {
          transition: all 0.2s ease-in-out;
          border-bottom: 1px solid #e5e7eb !important;
        }

        .modern-grid .e-row:hover {
          background-color: var(--primary-100) !important;
          box-shadow: inset 0 1px 3px rgba(59, 130, 246, 0.15) !important;
        }

        /* ストライプ効果 */
        .modern-grid .e-row:nth-child(even) {
          background-color: #f9fafb !important;
        }

        .modern-grid .e-rowcell {
          padding: 10px 8px !important;
          font-size: 13px !important;
          color: #1f2937 !important;
        }

        .modern-grid .e-gridheader {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%) !important;
        }

        /* ツールバーのスタイリング */
        .modern-grid .e-toolbar {
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%) !important;
          border-bottom: 1px solid #d1d5db !important;
          padding: 12px !important;
        }

        .modern-grid .e-toolbar button {
          border-radius: 6px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          color: #374151 !important;
        }

        .modern-grid .e-toolbar button:hover {
          background-color: var(--primary-500) !important;
          color: white !important;
        }

        /* ページャーのスタイリング */
        .modern-grid .e-pagercontainer {
          background: #f9fafb !important;
          border-top: 1px solid #e5e7eb !important;
          padding: 10px !important;
        }

        .modern-grid .e-numericitem {
          background: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          margin: 0 2px !important;
          color: #374151 !important;
        }

        .modern-grid .e-numericitem.e-active {
          background: var(--primary-500) !important;
          color: white !important;
          border-color: var(--primary-600) !important;
        }

        .modern-grid .e-filter-bartext {
          font-weight: 600 !important;
          color: #374151 !important;
        }
      `}</style>

      <GridComponent
        ref={gridRef}
        dataSource={tableData}
        allowSorting={true}
        allowPaging={true}
        allowFiltering={false}
        allowSelection={false}
        allowReordering={true}
        allowResizing={true}
        pageSettings={{ pageSize: 10, pageCount: 5 }}
        gridLines="Both"
        height="100%"
        enableHtmlSanitizer={false}
        cssClass="modern-grid"
        toolbar={['Search', 'ExcelExport']}
        rowDataBound={onRowDataBound}
        actionComplete={(args: any) => {
          if (args.requestType === 'save') {
            console.log('Grid data updated');
          }
        }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="label"
            headerText="期間"
            width="100"
            textAlign="Left"
            allowFiltering={true}
            allowSorting={true}
          />
          <ColumnDirective
            field="value"
            headerText={`値${data.unit ? ` (${data.unit})` : ''}`}
            width="130"
            textAlign="Right"
            template={numberTemplate}
            type="number"
          />
          {displayConfig.showCompareColumns && (
            <>
              <ColumnDirective
                field="compareValue"
                headerText={`比較値${data.unit ? ` (${data.unit})` : ''}`}
                width="130"
                textAlign="Right"
                template={compareValueTemplate}
                type="number"
              />
              <ColumnDirective
                field="difference"
                headerText={`差異${data.unit ? ` (${data.unit})` : ''}`}
                width="150"
                textAlign="Right"
                template={differenceTemplate}
                allowSorting={true}
              />
              <ColumnDirective
                field="differenceRate"
                headerText="差異率"
                width="130"
                textAlign="Right"
                template={differenceRateTemplate}
                allowSorting={true}
              />
            </>
          )}
        </ColumnsDirective>
        <Inject services={[Sort, Toolbar, ExcelExport, Page, Filter, Selection, Resize, Reorder]} />
      </GridComponent>
    </div>
  );
}
