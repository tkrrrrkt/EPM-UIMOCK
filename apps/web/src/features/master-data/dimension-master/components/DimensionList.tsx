'use client'

import type { BffDimensionSummary } from '@epm/contracts/bff/dimension-master'
import { cn } from '../ui/utils'

interface DimensionListProps {
  dimensions: BffDimensionSummary[]
  onSelectDimension: (dimension: BffDimensionSummary) => void
  onManageValues: (dimension: BffDimensionSummary) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function DimensionList({
  dimensions,
  onSelectDimension,
  onManageValues,
  onDeactivate,
  onReactivate,
}: DimensionListProps) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="p-3 text-left text-sm font-medium">コード</th>
            <th className="p-3 text-left text-sm font-medium">名前</th>
            <th className="p-3 text-left text-sm font-medium">タイプ</th>
            <th className="p-3 text-center text-sm font-medium">階層</th>
            <th className="p-3 text-center text-sm font-medium">スコープ</th>
            <th className="p-3 text-center text-sm font-medium">表示順</th>
            <th className="p-3 text-center text-sm font-medium">状態</th>
            <th className="p-3 text-center text-sm font-medium">アクション</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                ディメンションが見つかりません
              </td>
            </tr>
          ) : (
            dimensions.map((dimension) => (
              <tr
                key={dimension.id}
                className="border-b hover:bg-muted/30 cursor-pointer"
                onClick={() => onSelectDimension(dimension)}
              >
                <td className="p-3 text-sm font-mono">{dimension.dimensionCode}</td>
                <td className="p-3 text-sm">{dimension.dimensionName}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                      dimension.dimensionType === 'IR_SEGMENT' && 'bg-primary/10 text-primary',
                      dimension.dimensionType === 'PRODUCT_CATEGORY' && 'bg-secondary/10 text-secondary',
                      dimension.dimensionType === 'CUSTOMER_GROUP' && 'bg-accent/10 text-accent-foreground',
                      dimension.dimensionType === 'REGION' && 'bg-chart-1/10 text-chart-1',
                      dimension.dimensionType === 'CHANNEL' && 'bg-chart-2/10 text-chart-2',
                    )}
                  >
                    {dimension.dimensionType}
                  </span>
                </td>
                <td className="p-3 text-center text-sm">
                  {dimension.isHierarchical ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-muted">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-muted">
                    {dimension.scopePolicy === 'tenant' ? 'T' : 'C'}
                  </span>
                </td>
                <td className="p-3 text-center text-sm">{dimension.sortOrder}</td>
                <td className="p-3 text-center">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                      dimension.isActive
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {dimension.isActive ? '有効' : '無効'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onManageValues(dimension)
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      値を管理
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (dimension.isActive) {
                          onDeactivate(dimension.id)
                        } else {
                          onReactivate(dimension.id)
                        }
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {dimension.isActive ? '無効化' : '再有効化'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
