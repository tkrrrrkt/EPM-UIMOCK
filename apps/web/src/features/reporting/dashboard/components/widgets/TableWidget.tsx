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

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui';
import type { BffWidgetDto, BffWidgetDataResponseDto, TableDisplayConfig } from '@epm/contracts/bff/dashboard';

interface TableWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Table Widget Component
 * Displays data in table format with comparison columns
 */
export function TableWidget({ widget, data }: TableWidgetProps) {
  const displayConfig = widget.displayConfig as TableDisplayConfig;

  // Format number with commas
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return num.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>期間</TableHead>
              <TableHead className="text-right">値</TableHead>
              {displayConfig.showCompareColumns && (
                <>
                  <TableHead className="text-right">比較値</TableHead>
                  <TableHead className="text-right">差異</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.dataPoints.map((point, idx) => (
              <TableRow key={idx}>
                <TableCell>{point.label}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(point.value)}
                </TableCell>
                {displayConfig.showCompareColumns && (
                  <>
                    <TableCell className="text-right">
                      {formatNumber(point.compareValue ?? null)}
                    </TableCell>
                    <TableCell className="text-right">
                      {point.value !== null && point.compareValue !== null && point.compareValue !== undefined
                        ? formatNumber(point.value - point.compareValue)
                        : '-'}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with unit */}
      {data.unit && (
        <div className="mt-2 text-xs text-neutral-500 text-right">
          単位: {data.unit}
        </div>
      )}
    </div>
  );
}
