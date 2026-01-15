'use client'

interface DimensionFiltersProps {
  keyword: string
  dimensionType: string
  isActive: string
  onKeywordChange: (value: string) => void
  onDimensionTypeChange: (value: string) => void
  onIsActiveChange: (value: string) => void
}

const DIMENSION_TYPES = [
  { value: '', label: 'すべて' },
  { value: 'IR_SEGMENT', label: 'IRセグメント' },
  { value: 'PRODUCT_CATEGORY', label: '製品カテゴリ' },
  { value: 'CUSTOMER_GROUP', label: '得意先グループ' },
  { value: 'REGION', label: '地域' },
  { value: 'CHANNEL', label: '販売チャネル' },
]

const ACTIVE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'true', label: '有効のみ' },
  { value: 'false', label: '無効のみ' },
]

export function DimensionFilters({
  keyword,
  dimensionType,
  isActive,
  onKeywordChange,
  onDimensionTypeChange,
  onIsActiveChange,
}: DimensionFiltersProps) {
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
      <div className="w-[200px]">
        <select
          value={dimensionType}
          onChange={(e) => onDimensionTypeChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {DIMENSION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
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
