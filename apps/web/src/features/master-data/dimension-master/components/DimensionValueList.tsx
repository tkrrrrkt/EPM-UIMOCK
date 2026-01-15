'use client'

import type { BffDimensionValueSummary, BffDimensionDetailResponse } from '@epm/contracts/bff/dimension-master'
import { cn } from '../ui/utils'

interface DimensionValueListProps {
  parentDimension: BffDimensionDetailResponse
  values: BffDimensionValueSummary[]
  onSelectValue: (value: BffDimensionValueSummary) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function DimensionValueList({
  parentDimension,
  values,
  onSelectValue,
  onDeactivate,
  onReactivate,
}: DimensionValueListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span className="font-medium text-foreground">{parentDimension.dimensionName}</span>
        <span>({parentDimension.dimensionCode})</span>
        <span className="ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-muted">
          {parentDimension.dimensionType}
        </span>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">コード</th>
              <th className="p-3 text-left text-sm font-medium">名前</th>
              <th className="p-3 text-left text-sm font-medium">名前（短縮）</th>
              <th className="p-3 text-center text-sm font-medium">スコープ</th>
              <th className="p-3 text-center text-sm font-medium">階層レベル</th>
              <th className="p-3 text-center text-sm font-medium">表示順</th>
              <th className="p-3 text-center text-sm font-medium">状態</th>
              <th className="p-3 text-center text-sm font-medium">アクション</th>
            </tr>
          </thead>
          <tbody>
            {values.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                  ディメンション値が見つかりません
                </td>
              </tr>
            ) : (
              values.map((value) => (
                <tr
                  key={value.id}
                  className="border-b hover:bg-muted/30 cursor-pointer"
                  onClick={() => onSelectValue(value)}
                >
                  <td className="p-3 text-sm font-mono">{value.valueCode}</td>
                  <td className="p-3 text-sm" style={{ paddingLeft: `${12 + value.hierarchyLevel * 20}px` }}>
                    {value.hierarchyLevel > 0 && (
                      <span className="inline-block mr-2 text-muted-foreground font-mono">{'└─'}</span>
                    )}
                    {value.valueName}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{value.valueNameShort || '-'}</td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                        value.scopeType === 'tenant' ? 'border border-border' : 'bg-secondary/10 text-secondary',
                      )}
                    >
                      {value.scopeType === 'tenant' ? 'テナント' : '会社'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">{value.hierarchyLevel}</td>
                  <td className="p-3 text-center text-sm">{value.sortOrder}</td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                        value.isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {value.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (value.isActive) {
                          onDeactivate(value.id)
                        } else {
                          onReactivate(value.id)
                        }
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {value.isActive ? '無効化' : '再有効化'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
