'use client'

interface DimensionValueFiltersProps {
  keyword: string
  scopeType: string
  isActive: string
  onKeywordChange: (value: string) => void
  onScopeTypeChange: (value: string) => void
  onIsActiveChange: (value: string) => void
}

const SCOPE_TYPE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'tenant', label: 'テナント' },
  { value: 'company', label: '会社' },
]

const ACTIVE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'true', label: '有効のみ' },
  { value: 'false', label: '無効のみ' },
]

export function DimensionValueFilters({
  keyword,
  scopeType,
  isActive,
  onKeywordChange,
  onScopeTypeChange,
  onIsActiveChange,
}: DimensionValueFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="コードまたは名前で検索..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="w-[150px]">
        <select
          value={scopeType}
          onChange={(e) => onScopeTypeChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SCOPE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[150px]">
        <select
          value={isActive}
          onChange={(e) => onIsActiveChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ACTIVE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
