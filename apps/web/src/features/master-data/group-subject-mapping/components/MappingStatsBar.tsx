import { Card, Badge } from '@/shared/ui'

interface MappingStatsBarProps {
  mappedCount: number
  unmappedCount: number
  totalCount: number
}

export function MappingStatsBar({ mappedCount, unmappedCount, totalCount }: MappingStatsBarProps) {
  const percentage = totalCount > 0 ? Math.round((mappedCount / totalCount) * 100) : 0

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">マッピング進捗</div>
            <div className="text-2xl font-semibold text-foreground">
              {mappedCount} <span className="text-base text-muted-foreground">/ {totalCount}</span>
              <span className="ml-2 text-lg text-primary">({percentage}%)</span>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div className="flex gap-4">
            <div>
              <Badge variant="default" className="mb-1">
                マッピング済み
              </Badge>
              <div className="text-xl font-medium text-foreground">{mappedCount}件</div>
            </div>
            <div>
              <Badge variant="secondary" className="mb-1">
                未設定
              </Badge>
              <div className="text-xl font-medium text-foreground">{unmappedCount}件</div>
            </div>
          </div>
        </div>

        <div className="w-64">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
